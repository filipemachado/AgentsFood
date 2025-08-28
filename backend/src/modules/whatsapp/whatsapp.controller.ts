import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Param, 
  Put, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiQuery 
} from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppWebService } from './whatsapp-web.service';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { WhatsAppWebhookDto, SendMessageDto, WhatsAppConfigDto, TestConnectionDto } from './dto/webhook.dto';

@ApiTags('whatsapp')
@Controller()
export class WhatsappController {
  constructor(
    private whatsappService: WhatsappService,
    private whatsappWebService: WhatsAppWebService,
  ) {}

  // Webhook endpoints (public)
  @Get('webhook/whatsapp')
  @Public()
  @ApiOperation({ summary: 'Verificar webhook do WhatsApp' })
  @ApiResponse({ status: 200, description: 'Webhook verificado com sucesso' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook/whatsapp')
  @Public()
  @ApiOperation({ summary: 'Receber webhook do WhatsApp' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiBody({ type: WhatsAppWebhookDto })
  async handleWebhook(@Body() webhookData: WhatsAppWebhookDto) {
    return this.whatsappService.handleWebhook(webhookData);
  }

  // Protected endpoints para painel administrativo
  @Post('whatsapp/send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensagem manual via WhatsApp' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.whatsappService.sendMessageManual(sendMessageDto, establishmentId);
  }

  @Get('whatsapp/conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar conversas do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Lista de conversas retornada com sucesso' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página (padrão: 20)' })
  async getConversations(
    @CurrentUser('establishment.id') establishmentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.whatsappService.getConversations(establishmentId, page, limit);
  }

  @Get('whatsapp/conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar mensagens de uma conversa' })
  @ApiResponse({ status: 200, description: 'Mensagens retornadas com sucesso' })
  async getConversationMessages(
    @CurrentUser('establishment.id') establishmentId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.whatsappService.getConversationMessages(conversationId, establishmentId);
  }

  @Put('whatsapp/conversations/:conversationId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status de uma conversa' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        status: { 
          type: 'string', 
          enum: ['ACTIVE', 'ARCHIVED', 'BLOCKED'],
          example: 'ARCHIVED' 
        } 
      } 
    } 
  })
  async updateConversationStatus(
    @CurrentUser('establishment.id') establishmentId: string,
    @Param('conversationId') conversationId: string,
    @Body('status') status: string,
  ) {
    return this.whatsappService.updateConversationStatus(conversationId, status, establishmentId);
  }

  // Endpoints para configuração do WhatsApp
  @Get('whatsapp/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar configurações do WhatsApp' })
  @ApiResponse({ status: 200, description: 'Configurações retornadas com sucesso' })
  async getWhatsAppConfig(
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    return this.whatsappService.getWhatsAppConfig(establishmentId);
  }

  @Post('whatsapp/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Salvar configurações do WhatsApp' })
  @ApiResponse({ status: 200, description: 'Configurações salvas com sucesso' })
  @ApiBody({ type: WhatsAppConfigDto })
  async saveWhatsAppConfig(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() configDto: WhatsAppConfigDto,
  ) {
    return this.whatsappService.saveWhatsAppConfig(establishmentId, configDto);
  }

  @Post('whatsapp/test-connection')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Testar conexão com WhatsApp Business API' })
  @ApiResponse({ status: 200, description: 'Teste de conexão realizado' })
  @ApiBody({ type: TestConnectionDto })
  async testConnection(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() testDto: TestConnectionDto,
  ) {
    return this.whatsappService.testConnection(establishmentId, testDto);
  }

  @Post('whatsapp/test-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensagem de teste' })
  @ApiResponse({ status: 200, description: 'Mensagem de teste enviada' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        phoneNumber: { type: 'string', example: '5511999999999' },
        message: { type: 'string', example: 'Esta é uma mensagem de teste do AgentsFood!' }
      } 
    } 
  })
  async sendTestMessage(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() testData: { phoneNumber: string; message: string },
  ) {
    return this.whatsappService.sendTestMessage(establishmentId, testData.phoneNumber, testData.message);
  }

  // WhatsApp Web endpoints
  @Get('whatsapp-web/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter status da conexão WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'Status retornado com sucesso' })
  async getWhatsAppWebStatus() {
    const connectionStatus = this.whatsappWebService.getConnectionStatus();
    const stats = await this.whatsappWebService.getWebStats();
    
    return {
      ...connectionStatus,
      ...stats,
    };
  }

  @Post('whatsapp-web/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Conectar ao WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'Conexão iniciada' })
  async connectWhatsAppWeb() {
    if (!this.whatsappWebService.isEnabled()) {
      return {
        success: false,
        message: 'WhatsApp Web não está habilitado. Configure WHATSAPP_WEB_ENABLED=true nas variáveis de ambiente.',
      };
    }

    const connected = await this.whatsappWebService.connect();
    
    return {
      success: connected,
      message: connected 
        ? 'Conexão estabelecida com sucesso!' 
        : 'Falha ao conectar. Verifique os logs para mais detalhes.',
      status: this.whatsappWebService.getConnectionStatus(),
    };
  }

  @Post('whatsapp-web/disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desconectar do WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'Desconectado com sucesso' })
  async disconnectWhatsAppWeb() {
    await this.whatsappWebService.disconnect();
    
    return {
      success: true,
      message: 'Desconectado com sucesso!',
      status: this.whatsappWebService.getConnectionStatus(),
    };
  }

  @Post('whatsapp-web/reconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Forçar reconexão do WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'Reconexão iniciada' })
  async reconnectWhatsAppWeb() {
    if (!this.whatsappWebService.isEnabled()) {
      return {
        success: false,
        message: 'WhatsApp Web não está habilitado',
      };
    }

    const connected = await this.whatsappWebService.forceReconnect();
    
    return {
      success: connected,
      message: connected ? 'Reconexão bem-sucedida!' : 'Falha na reconexão',
      status: this.whatsappWebService.getConnectionStatus(),
    };
  }

  @Post('whatsapp-web/generate-qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar novo QR Code para WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'QR Code gerado' })
  async generateQRCode() {
    if (!this.whatsappWebService.isEnabled()) {
      return {
        success: false,
        message: 'WhatsApp Web não está habilitado',
      };
    }

    const generated = await this.whatsappWebService.generateNewQR();
    
    return {
      success: generated,
      message: generated 
        ? 'QR Code gerado! Verifique o terminal/logs do servidor.' 
        : 'WhatsApp Web já está conectado ou erro ao gerar QR Code',
      status: this.whatsappWebService.getConnectionStatus(),
    };
  }

  @Post('whatsapp-web/send-test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensagem de teste via WhatsApp Web' })
  @ApiResponse({ status: 200, description: 'Mensagem enviada' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        phoneNumber: { type: 'string', example: '5511999999999' },
        message: { type: 'string', example: 'Esta é uma mensagem de teste via WhatsApp Web!' }
      } 
    } 
  })
  async sendTestMessageWeb(
    @Body() testData: { phoneNumber: string; message: string },
  ) {
    if (!this.whatsappWebService.isWhatsAppWebConnected()) {
      return {
        success: false,
        message: 'WhatsApp Web não está conectado',
      };
    }

    const success = await this.whatsappWebService.sendMessageToPhone(
      testData.phoneNumber, 
      testData.message
    );
    
    return {
      success,
      message: success ? 'Mensagem enviada com sucesso!' : 'Falha ao enviar mensagem',
      phoneNumber: testData.phoneNumber,
      sentMessage: testData.message,
    };
  }
}