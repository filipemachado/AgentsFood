import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EnhancedAgentService } from '../agent/enhanced-agent.service';
import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  isJidBroadcast,
  isJidGroup,
  downloadContentFromMessage,
} from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
// Note: Boom is available in baileys types, não precisa de import separado

interface WhatsAppWebConfig {
  enabled: boolean;
  establishmentId: string;
  sessionPath?: string;
  autoReconnect: boolean;
  qrCodeTimeout: number;
}

@Injectable()
export class WhatsAppWebService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppWebService.name);
  private socket: WASocket | null = null;
  private isConnected = false;
  private connectionState: string = 'close';
  private qrCodeGenerated = false;
  private config: WhatsAppWebConfig;

  constructor(
    private prisma: PrismaService,
    private agentService: EnhancedAgentService,
    private configService: ConfigService,
  ) {
    this.config = {
      enabled: this.configService.get<boolean>('WHATSAPP_WEB_ENABLED', false),
      establishmentId: this.configService.get<string>('WHATSAPP_WEB_ESTABLISHMENT_ID', ''),
      sessionPath: this.configService.get<string>('WHATSAPP_WEB_SESSION_PATH', './whatsapp-session'),
      autoReconnect: this.configService.get<boolean>('WHATSAPP_WEB_AUTO_RECONNECT', true),
      qrCodeTimeout: this.configService.get<number>('WHATSAPP_WEB_QR_TIMEOUT', 60000),
    };
  }

  async onModuleInit() {
    if (this.config.enabled && this.config.establishmentId) {
      this.logger.log('WhatsApp Web is enabled, starting connection...');
      await this.connect();
    } else {
      this.logger.warn('WhatsApp Web is disabled or establishment ID not configured');
    }
  }

  async onModuleDestroy() {
    if (this.socket) {
      this.logger.log('Disconnecting WhatsApp Web...');
      await this.disconnect();
    }
  }

  async connect(): Promise<boolean> {
    try {
      this.logger.log('Initializing WhatsApp Web connection...');

      // Configurar autenticação persistente
      const { state, saveCreds } = await useMultiFileAuthState(this.config.sessionPath || './whatsapp-session');

      // Criar socket
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Vamos gerar QR manualmente
        logger: {
          level: 'silent',
          child: () => ({ level: 'silent' }),
        } as any,
        browser: ['AgentsFood', 'Chrome', '1.0.0'],
        defaultQueryTimeoutMs: 60000,
      });

      // Event listeners
      this.socket.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(update);
      });

      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('messages.upsert', async (messageUpdate) => {
        await this.handleIncomingMessages(messageUpdate);
      });

      this.socket.ev.on('messages.update', async (messageUpdate) => {
        this.logger.debug('Messages updated:', messageUpdate.length);
      });

      // Aguardar conexão por até 30 segundos
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (!this.isConnected) {
            this.logger.warn('Connection timeout reached');
            resolve(false);
          }
        }, 30000);

        this.socket!.ev.on('connection.update', (update) => {
          if (update.connection === 'open') {
            clearTimeout(timeout);
            resolve(true);
          } else if (update.connection === 'close') {
            clearTimeout(timeout);
            resolve(false);
          }
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp Web connection:', error);
      return false;
    }
  }

  private async handleConnectionUpdate(update: any) {
    const { connection, lastDisconnect, qr } = update;
    this.connectionState = connection;

    if (qr && !this.qrCodeGenerated) {
      this.logger.log('QR Code generated! Scan with your WhatsApp:');
      qrcode.generate(qr, { small: true });
      this.qrCodeGenerated = true;
      
      // Timeout para QR Code
      setTimeout(() => {
        if (!this.isConnected) {
          this.logger.warn('QR Code expired, please restart the service');
          this.qrCodeGenerated = false;
        }
      }, this.config.qrCodeTimeout);
    }

    if (connection === 'close') {
      this.isConnected = false;
      this.qrCodeGenerated = false;
      
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      if (shouldReconnect && this.config.autoReconnect) {
        this.logger.log('Connection closed, reconnecting...');
        setTimeout(() => this.connect(), 5000);
      } else {
        this.logger.log('Connection closed, not reconnecting');
      }
    } else if (connection === 'open') {
      this.isConnected = true;
      this.qrCodeGenerated = false;
      this.logger.log('WhatsApp Web connected successfully!');
      
      // Marcar estabelecimento como conectado
      if (this.config.establishmentId) {
        await this.markEstablishmentAsConnected(this.config.establishmentId, true);
      }
    }
  }

  private async handleIncomingMessages(messageUpdate: any) {
    const { messages, type } = messageUpdate;

    if (type !== 'notify') return;

    for (const message of messages) {
      if (message.key.fromMe) continue; // Ignorar mensagens enviadas por nós
      if (isJidBroadcast(message.key.remoteJid!) || isJidGroup(message.key.remoteJid!)) continue; // Ignorar grupos e broadcasts

      await this.processIncomingMessage(message);
    }
  }

  private async processIncomingMessage(message: any) {
    try {
      const messageContent = this.extractMessageContent(message);
      const senderJid = message.key.remoteJid!;
      const senderPhone = senderJid.replace('@s.whatsapp.net', '');

      this.logger.log(`Received message from ${senderPhone}: ${messageContent}`);

      if (!messageContent.trim()) {
        this.logger.debug('Empty message, skipping...');
        return;
      }

      // Buscar ou criar conversa
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          whatsappId: senderJid,
          establishmentId: this.config.establishmentId,
        },
      });

      if (!conversation) {
        // Obter nome do contato se disponível
        const contactName = message.pushName || 'Cliente';
        
        conversation = await this.prisma.conversation.create({
          data: {
            whatsappId: senderJid,
            customerPhone: senderPhone,
            customerName: contactName,
            establishmentId: this.config.establishmentId,
            lastMessageAt: new Date(message.messageTimestamp * 1000),
          },
        });

        this.logger.log(`Created new conversation for ${senderPhone}`);
      } else {
        // Atualizar última mensagem
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(message.messageTimestamp * 1000),
            customerName: message.pushName || conversation.customerName,
          },
        });
      }

      // Salvar mensagem recebida
      await this.prisma.message.create({
        data: {
          whatsappId: message.key.id!,
          content: messageContent,
          messageType: this.mapMessageType(message),
          direction: 'INBOUND',
          conversationId: conversation.id,
          metadata: message,
        },
      });

      // Processar com agente IA e enviar resposta
      if (messageContent) {
        const response = await this.agentService.generateResponse(
          messageContent,
          this.config.establishmentId,
          senderJid,
          senderPhone,
        );

        if (response) {
          const success = await this.sendMessage(senderJid, response);
          
          if (success) {
            // Salvar resposta enviada
            await this.prisma.message.create({
              data: {
                whatsappId: `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: response,
                messageType: 'TEXT',
                direction: 'OUTBOUND',
                conversationId: conversation.id,
                processed: true,
              },
            });

            this.logger.log(`Response sent to ${senderPhone}: ${response.substring(0, 100)}...`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing incoming message:', error);
    }
  }

  private extractMessageContent(message: any): string {
    try {
      if (message.message?.conversation) {
        return message.message.conversation;
      }
      
      if (message.message?.extendedTextMessage?.text) {
        return message.message.extendedTextMessage.text;
      }
      
      if (message.message?.imageMessage?.caption) {
        return `[Imagem] ${message.message.imageMessage.caption}`;
      }
      
      if (message.message?.imageMessage) {
        return '[Imagem enviada]';
      }
      
      if (message.message?.audioMessage) {
        return '[Áudio enviado]';
      }
      
      if (message.message?.videoMessage) {
        return '[Vídeo enviado]';
      }
      
      if (message.message?.documentMessage) {
        return `[Documento] ${message.message.documentMessage.fileName || 'arquivo'}`;
      }
      
      if (message.message?.locationMessage) {
        return '[Localização enviada]';
      }
      
      return '[Mensagem não suportada]';
    } catch (error) {
      this.logger.error('Error extracting message content:', error);
      return '[Erro ao processar mensagem]';
    }
  }

  private mapMessageType(message: any): 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' {
    try {
      if (message.message?.conversation || message.message?.extendedTextMessage) {
        return 'TEXT';
      }
      if (message.message?.imageMessage) return 'IMAGE';
      if (message.message?.audioMessage) return 'AUDIO';
      if (message.message?.videoMessage) return 'VIDEO';
      if (message.message?.documentMessage) return 'DOCUMENT';
      if (message.message?.locationMessage) return 'LOCATION';
      if (message.message?.contactMessage) return 'CONTACT';
      
      return 'TEXT';
    } catch (error) {
      this.logger.error('Error mapping message type:', error);
      return 'TEXT';
    }
  }

  async sendMessage(to: string, content: string): Promise<boolean> {
    try {
      if (!this.socket || !this.isConnected) {
        this.logger.error('WhatsApp Web not connected');
        return false;
      }

      // Garantir que o JID está no formato correto
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      
      await this.socket.sendMessage(jid, { text: content });
      
      this.logger.debug(`Message sent to ${jid}: ${content.substring(0, 100)}...`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      return false;
    }
  }

  async sendMessageToPhone(phoneNumber: string, content: string): Promise<boolean> {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;
    return this.sendMessage(jid, content);
  }

  async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        await this.socket.logout();
        this.socket = null;
        this.isConnected = false;
        
        if (this.config.establishmentId) {
          await this.markEstablishmentAsConnected(this.config.establishmentId, false);
        }
        
        this.logger.log('WhatsApp Web disconnected successfully');
      }
    } catch (error) {
      this.logger.error('Error disconnecting WhatsApp Web:', error);
    }
  }

  private async markEstablishmentAsConnected(establishmentId: string, connected: boolean): Promise<void> {
    try {
      // Adicionar campo ao schema se não existir
      await this.prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          // Adicionar campo whatsappWebConnected se não existir no schema
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error updating establishment connection status:', error);
    }
  }

  // Métodos públicos para controle
  getConnectionStatus(): {
    connected: boolean;
    state: string;
    qrGenerated: boolean;
  } {
    return {
      connected: this.isConnected,
      state: this.connectionState,
      qrGenerated: this.qrCodeGenerated,
    };
  }

  async forceReconnect(): Promise<boolean> {
    this.logger.log('Forcing reconnection...');
    await this.disconnect();
    return this.connect();
  }

  async generateNewQR(): Promise<boolean> {
    if (!this.isConnected) {
      this.qrCodeGenerated = false;
      return this.connect();
    }
    return false;
  }

  // Métodos para integração com o sistema existente
  isEnabled(): boolean {
    return this.config.enabled;
  }

  isWhatsAppWebConnected(): boolean {
    return this.isConnected;
  }

  async getWebStats() {
    return {
      enabled: this.config.enabled,
      connected: this.isConnected,
      connectionState: this.connectionState,
      establishmentId: this.config.establishmentId,
      autoReconnect: this.config.autoReconnect,
    };
  }
}