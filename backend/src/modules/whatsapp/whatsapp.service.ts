import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AgentService } from '../agent/agent.service';
import { WhatsAppWebhookDto, SendMessageDto, WhatsAppConfigDto, TestConnectionDto } from './dto/webhook.dto';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly whatsappToken: string;
  private readonly whatsappUrl = 'https://graph.facebook.com/v22.0';

  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private configService: ConfigService,
  ) {
    this.whatsappToken = this.configService.get<string>('WHATSAPP_TOKEN') || '';
  }

  async verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || 'verify-token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully');
      return challenge;
    }
    
    throw new BadRequestException('Invalid verification token');
  }

  async handleWebhook(webhookData: WhatsAppWebhookDto) {
    try {
      this.logger.log('Processing WhatsApp webhook:', JSON.stringify(webhookData, null, 2));

      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.processMessages(change.value);
          }
        }
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  private async processMessages(value: any) {
    const { messages, contacts, metadata } = value;
    
    if (!messages || messages.length === 0) {
      return;
    }

    // Buscar estabelecimento pelo phone_number_id
    const establishment = await this.prisma.establishment.findFirst({
      where: {
        whatsappPhoneNumberId: metadata.phone_number_id,
      },
    });

    if (!establishment) {
      this.logger.warn(`Establishment not found for phone_number_id: ${metadata.phone_number_id}`);
      return;
    }

    for (const message of messages) {
      await this.processMessage(message, contacts, establishment.id);
    }
  }

  private async processMessage(message: any, contacts: any[], establishmentId: string) {
    try {
      // Buscar informações do contato
      const contact = contacts?.find(c => c.wa_id === message.from);
      const customerName = contact?.profile?.name || 'Cliente';

      // Buscar ou criar conversa
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          whatsappId: message.from,
          establishmentId: establishmentId,
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            whatsappId: message.from,
            customerPhone: message.from,
            customerName: customerName,
            establishmentId: establishmentId,
            lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
          },
        });
      } else {
        // Atualizar última mensagem
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(parseInt(message.timestamp) * 1000),
            customerName: customerName, // Atualizar nome se disponível
          },
        });
      }

      // Salvar mensagem recebida
      await this.prisma.message.create({
        data: {
          whatsappId: message.id,
          content: this.extractMessageContent(message),
          messageType: this.mapMessageType(message.type),
          direction: 'INBOUND',
          conversationId: conversation.id,
          metadata: message,
        },
      });

      // Gerar e enviar resposta automática
      if (message.type === 'text' && message.text?.body) {
        const response = await this.agentService.generateResponse(
          message.text.body,
          establishmentId
        );

        if (response) {
          await this.sendMessage(message.from, response, establishmentId);
          
          // Salvar resposta enviada
          await this.prisma.message.create({
            data: {
              whatsappId: `out_${Date.now()}`,
              content: response,
              messageType: 'TEXT',
              direction: 'OUTBOUND',
              conversationId: conversation.id,
              processed: true,
            },
          });
        }
      }

    } catch (error) {
      this.logger.error('Error processing message:', error);
    }
  }

  private extractMessageContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return '[Imagem enviada]';
      case 'audio':
        return '[Áudio enviado]';
      case 'video':
        return '[Vídeo enviado]';
      case 'document':
        return '[Documento enviado]';
      default:
        return '[Mensagem não suportada]';
    }
  }

  private mapMessageType(type: string): 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' {
    const typeMap: Record<string, 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT'> = {
      'text': 'TEXT',
      'image': 'IMAGE',
      'audio': 'AUDIO',
      'video': 'VIDEO',
      'document': 'DOCUMENT',
      'location': 'LOCATION',
      'contact': 'CONTACT',
    };
    return typeMap[type] || 'TEXT';
  }

  async sendMessage(to: string, message: string, establishmentId?: string): Promise<any> {
    try {
      let phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');

      // Se establishmentId foi fornecido, buscar phone_number_id específico
      if (establishmentId) {
        const establishment = await this.prisma.establishment.findUnique({
          where: { id: establishmentId },
          select: { whatsappPhoneNumberId: true },
        });
        
        if (establishment?.whatsappPhoneNumberId) {
          phoneNumberId = establishment.whatsappPhoneNumberId;
        }
      }

      if (!phoneNumberId) {
        throw new Error('WhatsApp Phone Number ID não configurado');
      }

      const url = `${this.whatsappUrl}/${phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Message sent successfully to ${to}`);
      return response.data;

    } catch (error) {
      this.logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessageManual(sendMessageDto: SendMessageDto, establishmentId: string) {
    return this.sendMessage(sendMessageDto.to, sendMessageDto.message, establishmentId);
  }

  async getConversations(establishmentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { establishmentId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: { establishmentId },
      }),
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationMessages(conversationId: string, establishmentId: string) {
    // Verificar se a conversa pertence ao estabelecimento
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        establishmentId,
      },
    });

    if (!conversation) {
      throw new BadRequestException('Conversa não encontrada');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      conversation,
      messages,
    };
  }

  async updateConversationStatus(conversationId: string, status: string, establishmentId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        establishmentId,
      },
    });

    if (!conversation) {
      throw new BadRequestException('Conversa não encontrada');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: status as any },
    });
  }

  // Novos métodos para configuração do WhatsApp
  async getWhatsAppConfig(establishmentId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: {
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappToken: true,
      },
    });

    if (!establishment) {
      throw new BadRequestException('Estabelecimento não encontrado');
    }

    return {
      whatsappPhoneNumberId: establishment.whatsappPhoneNumberId || '',
      whatsappBusinessAccountId: establishment.whatsappBusinessAccountId || '',
      whatsappToken: establishment.whatsappToken || '', // ✅ Retornar token completo para configuração
      isConfigured: !!(establishment.whatsappPhoneNumberId && establishment.whatsappToken),
    };
  }

  async saveWhatsAppConfig(establishmentId: string, configDto: WhatsAppConfigDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new BadRequestException('Estabelecimento não encontrado');
    }

    const updateData: any = {};
    
    if (configDto.whatsappPhoneNumberId) {
      updateData.whatsappPhoneNumberId = configDto.whatsappPhoneNumberId;
    }
    
    if (configDto.whatsappBusinessAccountId) {
      updateData.whatsappBusinessAccountId = configDto.whatsappBusinessAccountId;
    }
    
    if (configDto.whatsappToken) {
      updateData.whatsappToken = configDto.whatsappToken;
    }

    const updatedEstablishment = await this.prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
      select: {
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappToken: true,
      },
    });

    this.logger.log(`WhatsApp configuration updated for establishment: ${establishmentId}`);

    return {
      whatsappPhoneNumberId: updatedEstablishment.whatsappPhoneNumberId || '',
      whatsappBusinessAccountId: updatedEstablishment.whatsappBusinessAccountId || '',
      whatsappToken: updatedEstablishment.whatsappToken ? '***' + updatedEstablishment.whatsappToken.slice(-4) : '',
      isConfigured: !!(updatedEstablishment.whatsappPhoneNumberId && updatedEstablishment.whatsappToken),
      message: 'Configurações salvas com sucesso'
    };
  }

  async testConnection(establishmentId: string, testDto: TestConnectionDto) {
    try {
      // Teste 1: Verificar se o token é válido fazendo uma requisição à API do WhatsApp
      const url = `${this.whatsappUrl}/${testDto.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${testDto.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Connection test successful for establishment: ${establishmentId}`);

      return {
        success: true,
        message: 'Conexão com WhatsApp Business API estabelecida com sucesso!',
        phoneNumberId: testDto.phoneNumberId,
        displayPhoneNumber: response.data?.display_phone_number || 'N/A',
        verifiedName: response.data?.verified_name || 'N/A',
        details: {
          status: response.data?.status || 'unknown',
          platform: response.data?.platform || 'whatsapp_business_api'
        }
      };

    } catch (error) {
      this.logger.error('WhatsApp connection test failed:', error.response?.data || error.message);
      
      let errorMessage = 'Falha ao conectar com a API do WhatsApp';
      
      if (error.response?.status === 401) {
        errorMessage = 'Token de acesso inválido. Verifique suas credenciais.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Phone Number ID não encontrado. Verifique o ID fornecido.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message,
      };
    }
  }

  async sendTestMessage(establishmentId: string, phoneNumber: string, message: string) {
    try {
      // Buscar configurações do estabelecimento
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId },
        select: {
          whatsappPhoneNumberId: true,
          whatsappToken: true,
        },
      });

      if (!establishment?.whatsappPhoneNumberId || !establishment?.whatsappToken) {
        throw new BadRequestException('WhatsApp não configurado para este estabelecimento');
      }

      // Formatear número de telefone (remover caracteres especiais)
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Enviar mensagem usando o método existente
      const result = await this.sendMessage(cleanPhoneNumber, message, establishmentId);

      this.logger.log(`Test message sent successfully to ${cleanPhoneNumber}`);

      return {
        success: true,
        message: 'Mensagem de teste enviada com sucesso!',
        messageId: result.messages?.[0]?.id,
        to: cleanPhoneNumber,
        sentMessage: message,
      };

    } catch (error) {
      this.logger.error('Failed to send test message:', error.response?.data || error.message);
      
      let errorMessage = 'Falha ao enviar mensagem de teste';
      
      if (error.response?.status === 401) {
        errorMessage = 'Token de acesso inválido';
      } else if (error.response?.status === 400) {
        errorMessage = 'Número de telefone inválido ou outros parâmetros incorretos';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message,
      };
    }
  }

  // Método para verificar se o WhatsApp está configurado
  async isWhatsAppConfigured(establishmentId: string): Promise<boolean> {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: {
        whatsappPhoneNumberId: true,
        whatsappToken: true,
      },
    });

    return !!(establishment?.whatsappPhoneNumberId && establishment?.whatsappToken);
  }

  // Método para obter estatísticas básicas do WhatsApp
  async getWhatsAppStats(establishmentId: string) {
    const [totalConversations, activeConversations, totalMessages] = await Promise.all([
      this.prisma.conversation.count({
        where: { establishmentId },
      }),
      this.prisma.conversation.count({
        where: { 
          establishmentId,
          status: 'ACTIVE',
        },
      }),
      this.prisma.message.count({
        where: {
          conversation: {
            establishmentId,
          },
        },
      }),
    ]);

    return {
      totalConversations,
      activeConversations,
      totalMessages,
      isConfigured: await this.isWhatsAppConfigured(establishmentId),
    };
  }
}