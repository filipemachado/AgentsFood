import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiBody 
} from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { EnhancedAgentService } from './enhanced-agent.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateAgentConfigDto } from './dto/create-agent-config.dto';
import { UpdateAgentConfigDto } from './dto/update-agent-config.dto';

@ApiTags('agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(
    private agentService: AgentService,
    private enhancedAgentService: EnhancedAgentService
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'Buscar configuração do agente' })
  @ApiResponse({ status: 200, description: 'Configuração encontrada' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  async getConfig(@CurrentUser('establishment.id') establishmentId: string) {
    return this.agentService.getConfig(establishmentId);
  }

  @Post('config')
  @ApiOperation({ summary: 'Criar configuração do agente' })
  @ApiResponse({ status: 201, description: 'Configuração criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Configuração já existe' })
  @ApiBody({ type: CreateAgentConfigDto })
  async createConfig(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() createAgentConfigDto: CreateAgentConfigDto,
  ) {
    return this.agentService.createConfig(establishmentId, createAgentConfigDto);
  }

  @Put('config')
  @ApiOperation({ summary: 'Atualizar configuração do agente' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  @ApiBody({ type: UpdateAgentConfigDto })
  async updateConfig(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() updateAgentConfigDto: UpdateAgentConfigDto,
  ) {
    return this.agentService.updateConfig(establishmentId, updateAgentConfigDto);
  }

  @Delete('config')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar configuração do agente' })
  @ApiResponse({ status: 204, description: 'Configuração deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  async deleteConfig(@CurrentUser('establishment.id') establishmentId: string) {
    return this.agentService.deleteConfig(establishmentId);
  }

  @Post('test-response')
  @ApiOperation({ summary: 'Testar resposta do agente (para desenvolvimento)' })
  @ApiResponse({ status: 200, description: 'Resposta gerada com sucesso' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        message: { type: 'string', example: 'Olá, qual o cardápio de hoje?' } 
      } 
    } 
  })
  async testResponse(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body('message') message: string,
  ) {
    const response = await this.enhancedAgentService.generateResponse(
      message, 
      establishmentId, 
      `test_${Date.now()}`, 
      'test_phone'
    );
    return { 
      userMessage: message, 
      agentResponse: response,
      timestamp: new Date().toISOString()
    };
  }
}