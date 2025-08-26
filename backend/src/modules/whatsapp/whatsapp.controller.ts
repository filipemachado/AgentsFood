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
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { WhatsAppWebhookDto, SendMessageDto, WhatsAppConfigDto, TestConnectionDto } from './dto/webhook.dto';

@ApiTags('whatsapp')
@Controller()
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

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
}