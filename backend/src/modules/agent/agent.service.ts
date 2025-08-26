import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAgentConfigDto } from './dto/create-agent-config.dto';
import { UpdateAgentConfigDto } from './dto/update-agent-config.dto';
import OpenAI from 'openai';

@Injectable()
export class AgentService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async getConfig(establishmentId: string) {
    const config = await this.prisma.agentConfig.findUnique({
      where: { establishmentId },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      }
    });

    if (!config) {
      throw new NotFoundException('Configuração do agente não encontrada');
    }

    return config;
  }

  async createConfig(establishmentId: string, data: CreateAgentConfigDto) {
    // Verificar se já existe configuração
    const existing = await this.prisma.agentConfig.findUnique({
      where: { establishmentId },
    });

    if (existing) {
      throw new BadRequestException('Configuração do agente já existe para este estabelecimento');
    }

    return this.prisma.agentConfig.create({
      data: {
        ...data,
        establishmentId,
      },
    });
  }

  async updateConfig(establishmentId: string, data: UpdateAgentConfigDto) {
    const existing = await this.prisma.agentConfig.findUnique({
      where: { establishmentId },
    });

    if (!existing) {
      throw new NotFoundException('Configuração do agente não encontrada');
    }

    return this.prisma.agentConfig.update({
      where: { establishmentId },
      data,
    });
  }

  async deleteConfig(establishmentId: string) {
    const existing = await this.prisma.agentConfig.findUnique({
      where: { establishmentId },
    });

    if (!existing) {
      throw new NotFoundException('Configuração do agente não encontrada');
    }

    return this.prisma.agentConfig.delete({
      where: { establishmentId },
    });
  }

  async generateResponse(message: string, establishmentId: string) {
    try {
      // Buscar configuração do agente
      const config = await this.prisma.agentConfig.findUnique({
        where: { establishmentId },
      });

      if (!config || !config.active) {
        return config?.fallbackMessage || 'Agente indisponível no momento.';
      }

      // Buscar informações do estabelecimento e produtos
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId },
        include: {
          products: {
            where: { available: true },
            include: { category: true },
            orderBy: { displayOrder: 'asc' }
          },
          categories: {
            where: { active: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      if (!establishment) {
        return config.fallbackMessage || 'Estabelecimento não encontrado.';
      }

      // Se OpenAI não estiver configurada, usar resposta básica
      if (!this.openai) {
        return this.generateBasicResponse(message, establishment, config);
      }

      // Gerar resposta com OpenAI
      return this.generateAIResponse(message, establishment, config);

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
    }
  }

  private generateBasicResponse(message: string, establishment: any, config: any) {
    const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Resposta para cardápio/menu
    if (lowerMessage.includes('cardapio') || lowerMessage.includes('menu') || lowerMessage.includes('produtos') || 
        lowerMessage.includes('lanches') || lowerMessage.includes('comida') || lowerMessage.includes('qual') ||
        lowerMessage.includes('ola') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') ||
        lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
      const categories = establishment.categories;
      
      if (categories.length === 0) {
        return 'Ainda não temos produtos cadastrados. Entre em contato diretamente conosco!';
      }

      let response = `🍽️ **Nosso Cardápio - ${establishment.name}**\n\n`;
      
      categories.forEach(category => {
        const categoryProducts = establishment.products.filter(p => p.categoryId === category.id);
        if (categoryProducts.length > 0) {
          response += `**${category.name}**\n`;
          categoryProducts.slice(0, 5).forEach(product => {
            response += `• ${product.name} - R$ ${product.price}\n`;
            if (product.description) {
              response += `  ${product.description}\n`;
            }
          });
          response += '\n';
        }
      });

      return response.substring(0, config.maxResponseLength || 300);
    }

    // Resposta para preços
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custa')) {
      return 'Para consultar preços específicos, me diga qual produto você gostaria de saber! Ou digite "cardápio" para ver todos os produtos.';
    }

    // Resposta para contato
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('endereço')) {
      let response = `📞 **Contato - ${establishment.name}**\n\n`;
      if (establishment.phone) response += `Telefone: ${establishment.phone}\n`;
      if (establishment.address) response += `Endereço: ${establishment.address}\n`;
      return response;
    }

    // Resposta padrão
    return config.fallbackMessage || 'Olá! Posso ajudá-lo com informações sobre nosso cardápio, preços e produtos. Digite "cardápio" para ver nossos produtos!';
  }

  private async generateAIResponse(message: string, establishment: any, config: any) {
    const systemPrompt = this.buildSystemPrompt(establishment, config);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: Math.min(config.maxResponseLength || 300, 500),
        temperature: config.tone === 'professional' ? 0.3 : 0.7,
      });

      return completion.choices[0]?.message?.content || config.fallbackMessage;
    } catch (error) {
      console.error('Erro na API OpenAI:', error);
      return this.generateBasicResponse(message, establishment, config);
    }
  }

  private buildSystemPrompt(establishment: any, config: any): string {
    const features = config.enabledFeatures || {};
    
    let prompt = `Você é um assistente virtual do ${establishment.name}. `;
    
    // Tom de voz
    switch (config.tone) {
      case 'professional':
        prompt += 'Mantenha um tom profissional e formal. ';
        break;
      case 'casual':
        prompt += 'Use um tom descontraído e amigável. ';
        break;
      default:
        prompt += 'Seja amigável e acolhedor. ';
    }

    if (config.customPrompt) {
      prompt += config.customPrompt + ' ';
    }

    prompt += '\n\nInformações do estabelecimento:\n';
    prompt += `Nome: ${establishment.name}\n`;
    if (establishment.description) prompt += `Descrição: ${establishment.description}\n`;
    if (establishment.phone) prompt += `Telefone: ${establishment.phone}\n`;
    if (establishment.address) prompt += `Endereço: ${establishment.address}\n`;

    if (features.menu && establishment.products?.length > 0) {
      prompt += '\n**CARDÁPIO DISPONÍVEL:**\n';
      establishment.categories.forEach(category => {
        const categoryProducts = establishment.products.filter(p => p.categoryId === category.id);
        if (categoryProducts.length > 0) {
          prompt += `\n${category.name}:\n`;
          categoryProducts.forEach(product => {
            prompt += `- ${product.name}`;
            if (features.prices) prompt += ` - R$ ${product.price}`;
            if (product.description) prompt += ` (${product.description})`;
            prompt += '\n';
          });
        }
      });
    }

    prompt += '\n\nRegras importantes:';
    prompt += '\n- Responda APENAS sobre o cardápio, preços e informações do estabelecimento';
    prompt += '\n- Se perguntarem sobre outros assuntos, redirecione para o cardápio';
    prompt += '\n- Mantenha as respostas concisas e úteis';
    prompt += '\n- Use emojis de forma moderada para deixar a conversa mais amigável';
    
    if (!features.prices) {
      prompt += '\n- NÃO forneça informações de preços, apenas mencione que estão disponíveis mediante contato';
    }
    
    if (!features.availability) {
      prompt += '\n- NÃO confirme disponibilidade de produtos, peça para o cliente entrar em contato';
    }

    return prompt;
  }
}