import { IsString, IsOptional, IsBoolean, IsInt, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentConfigDto {
  @ApiPropertyOptional({
    description: 'Mensagem de boas-vindas do agente',
    example: 'Olá! Bem-vindo ao nosso cardápio! Como posso ajudá-lo hoje?'
  })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiPropertyOptional({
    description: 'Tom de voz do agente',
    example: 'friendly',
    enum: ['friendly', 'professional', 'casual']
  })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional({
    description: 'Idioma do agente',
    example: 'pt-BR'
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Tamanho máximo da resposta em caracteres',
    example: 300,
    minimum: 100,
    maximum: 1000
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(1000)
  maxResponseLength?: number;

  @ApiPropertyOptional({
    description: 'Funcionalidades habilitadas do agente',
    example: { menu: true, prices: true, availability: true, suggestions: true }
  })
  @IsOptional()
  @IsObject()
  enabledFeatures?: Record<string, boolean>;

  @ApiPropertyOptional({
    description: 'Prompt personalizado para o agente',
    example: 'Você é um atendente especializado em nossa lanchonete...'
  })
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional({
    description: 'Mensagem de fallback quando o agente não entende',
    example: 'Desculpe, não entendi sua pergunta. Posso ajudá-lo com informações sobre nosso cardápio.'
  })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiPropertyOptional({
    description: 'Se o agente está ativo',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}