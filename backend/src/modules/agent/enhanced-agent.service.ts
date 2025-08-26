import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConversationService, ConversationContext, CurrentOrder } from './conversation.service';
import OpenAI from 'openai';

interface MessageIntent {
  type: 'greeting' | 'menu_request' | 'product_inquiry' | 'order_item' | 'order_modification' | 
        'order_confirmation' | 'contact_info' | 'other';
  confidence: number;
  entities?: {
    productName?: string;
    categoryName?: string;
    quantity?: number;
    modifications?: string[];
  };
}

@Injectable()
export class EnhancedAgentService {
  private openai: OpenAI;

  private greetingVariations = [
    'Olá! {name} Seja muito bem-vindo(a) ao {establishment}! 😊',
    'Oi! {name} Que bom ter você aqui no {establishment}! 👋',
    'Olá! {name} Bem-vindo(a) ao {establishment}! Como posso ajudá-lo(a) hoje?',
  ];

  private menuPromptVariations = [
    'Gostaria de conhecer nosso cardápio? 📋',
    'Que tal dar uma olhada no que temos de delicioso hoje? 🍽️',
    'Posso apresentar nossos produtos para você? 📋',
  ];

  constructor(
    private prisma: PrismaService,
    private conversationService: ConversationService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateResponse(
    message: string,
    establishmentId: string,
    whatsappId: string = 'test',
    customerPhone: string = 'test',
    customerName?: string
  ): Promise<string> {
    try {
      // Get or create conversation
      const conversation = await this.conversationService.getOrCreateConversation(
        whatsappId,
        establishmentId,
        customerPhone,
        customerName
      );

      // Get current context
      const context = this.conversationService.getContext(conversation);
      const currentOrder = this.conversationService.getCurrentOrder(conversation);

      // Get establishment and agent config
      const establishment = await this.getEstablishment(establishmentId);
      const config = await this.getAgentConfig(establishmentId);

      if (!establishment || !config?.active) {
        return config?.fallbackMessage || 'Agente indisponível no momento.';
      }

      // Analyze message intent
      const intent = await this.analyzeMessageIntent(message, establishment, context);

      // Generate contextual response
      const response = await this.generateContextualResponse(
        intent,
        message,
        establishment,
        config,
        context,
        currentOrder,
        conversation.id
      );

      // Store message
      await this.storeMessage(conversation.id, message, response);

      return response;

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
    }
  }

  private async analyzeMessageIntent(
    message: string,
    establishment: any,
    context: ConversationContext
  ): Promise<MessageIntent> {
    const normalizedMessage = message.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Greeting patterns
    if (normalizedMessage.match(/\b(ola|oi|bom dia|boa tarde|boa noite|opa|e ai)\b/)) {
      return { type: 'greeting', confidence: 0.9 };
    }

    // Menu request patterns
    if (normalizedMessage.match(/\b(cardapio|menu|produtos|lanches|comida|o que tem|que vocês tem)\b/)) {
      return { type: 'menu_request', confidence: 0.8 };
    }

    // Product inquiry patterns
    const productMatch = this.findProductInMessage(normalizedMessage, establishment.products);
    if (productMatch) {
      return {
        type: 'product_inquiry',
        confidence: 0.8,
        entities: { productName: productMatch.name }
      };
    }

    // Order patterns
    if (normalizedMessage.match(/\b(quero|vou querer|queria|gostaria|pedir|pode ser)\b/)) {
      const product = this.findProductInMessage(normalizedMessage, establishment.products);
      const quantity = this.extractQuantity(normalizedMessage);
      const modifications = this.extractModifications(normalizedMessage);

      return {
        type: 'order_item',
        confidence: 0.7,
        entities: {
          productName: product?.name,
          quantity,
          modifications
        }
      };
    }

    // Contact info patterns
    if (normalizedMessage.match(/\b(contato|telefone|endereco|onde fica|localização)\b/)) {
      return { type: 'contact_info', confidence: 0.8 };
    }

    return { type: 'other', confidence: 0.5 };
  }

  private async generateContextualResponse(
    intent: MessageIntent,
    message: string,
    establishment: any,
    config: any,
    context: ConversationContext,
    currentOrder: CurrentOrder | null,
    conversationId: string
  ): Promise<string> {
    switch (intent.type) {
      case 'greeting':
        return this.handleGreeting(establishment, config, context, conversationId);

      case 'menu_request':
        return this.handleMenuRequest(establishment, config, context, conversationId);

      case 'product_inquiry':
        return this.handleProductInquiry(
          intent.entities?.productName,
          establishment,
          config,
          context,
          conversationId
        );

      case 'order_item':
        return this.handleOrderItem(
          intent.entities,
          establishment,
          config,
          context,
          conversationId
        );

      case 'contact_info':
        return this.handleContactInfo(establishment, config);

      default:
        return this.handleGeneral(message, establishment, config, context);
    }
  }

  private async handleGreeting(
    establishment: any,
    config: any,
    context: ConversationContext,
    conversationId: string
  ): Promise<string> {
    // Update context to greeting
    await this.conversationService.updateConversationContext(conversationId, {
      state: 'greeting',
      greetingShown: true
    });

    const isRecentInteraction = this.conversationService.isRecentInteraction(context, 30);
    
    if (context.greetingShown && isRecentInteraction) {
      // Returning customer
      const variations = [
        `Olá novamente! Como posso ajudá-lo(a) hoje? 😊`,
        `Oi! Que bom ter você de volta! Em que posso ajudar?`,
        `Ola! Pronto(a) para fazer um novo pedido? 🍽️`
      ];
      return this.getRandomVariation(variations) + this.addMenuPrompt();
    }

    // First greeting or after long time
    let greeting = config.welcomeMessage || this.getRandomVariation(this.greetingVariations);
    greeting = greeting
      .replace('{establishment}', establishment.name)
      .replace('{name}', '');

    return greeting + ' ' + this.getRandomVariation(this.menuPromptVariations);
  }

  private async handleMenuRequest(
    establishment: any,
    config: any,
    context: ConversationContext,
    conversationId: string
  ): Promise<string> {
    // Update context to browsing menu
    await this.conversationService.updateConversationContext(conversationId, {
      state: 'browsing_menu',
      menuShown: true
    });

    const categories = establishment.categories.filter(c => c.active);
    
    if (categories.length === 0) {
      return 'Ainda não temos produtos cadastrados. Entre em contato diretamente conosco!';
    }

    let response = `🍽️ **Cardápio ${establishment.name}**\n\n`;

    if (categories.length === 1) {
      // Show products directly if only one category
      const products = establishment.products.filter(p => 
        p.available && p.categoryId === categories[0].id
      ).slice(0, 8);

      response += `**${categories[0].name}:**\n`;
      products.forEach(product => {
        response += `🔹 **${product.name}** - R$ ${product.price}\n`;
        if (product.description) {
          response += `   ${product.description}\n`;
        }
      });
    } else {
      // Show categories first
      response += 'Escolha uma categoria:\n\n';
      categories.forEach((category, index) => {
        const productCount = establishment.products.filter(p => 
          p.available && p.categoryId === category.id
        ).length;
        response += `${index + 1}. **${category.name}** (${productCount} itens)\n`;
        if (category.description) {
          response += `   ${category.description}\n`;
        }
      });
      response += '\nDigite o número ou nome da categoria que deseja ver! 📋';
    }

    return response.substring(0, config.maxResponseLength || 1000);
  }

  private async handleProductInquiry(
    productName: string | undefined,
    establishment: any,
    config: any,
    context: ConversationContext,
    conversationId: string
  ): Promise<string> {
    if (!productName) {
      return 'Qual produto você gostaria de saber mais informações? 🤔';
    }

    const product = establishment.products.find(p =>
      p.available && p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (!product) {
      return `Não encontrei "${productName}" em nosso cardápio. Gostaria de ver nossos produtos disponíveis? 📋`;
    }

    await this.conversationService.updateConversationContext(conversationId, {
      state: 'viewing_category'
    });

    let response = `🔹 **${product.name}** - R$ ${product.price}\n`;
    if (product.description) {
      response += `${product.description}\n\n`;
    }

    const variations = [
      'Gostaria de adicionar ao seu pedido? 🛒',
      'Posso anotar para você? ✍️',
      'Vamos adicionar ao pedido? 📝'
    ];

    return response + this.getRandomVariation(variations);
  }

  private async handleOrderItem(
    entities: any,
    establishment: any,
    config: any,
    context: ConversationContext,
    conversationId: string
  ): Promise<string> {
    const productName = entities?.productName;
    const quantity = entities?.quantity || 1;
    const modifications = entities?.modifications || [];

    if (!productName) {
      return 'Qual produto você gostaria de pedir? 🤔';
    }

    const product = establishment.products.find(p =>
      p.available && p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (!product) {
      return `Desculpe, não temos "${productName}" disponível. Gostaria de ver nosso cardápio? 📋`;
    }

    // Add to order
    await this.conversationService.addToOrder(
      conversationId,
      product.id,
      product.name,
      parseFloat(product.price),
      quantity,
      modifications
    );

    await this.conversationService.updateConversationContext(conversationId, {
      state: 'ordering'
    });

    let response = `✅ Adicionei **${quantity}x ${product.name}** ao seu pedido!\n`;
    if (modifications.length > 0) {
      response += `Observações: ${modifications.join(', ')}\n`;
    }
    response += `Valor: R$ ${(parseFloat(product.price) * quantity).toFixed(2)}\n\n`;

    const continueVariations = [
      'Gostaria de adicionar mais alguma coisa? 🍽️',
      'Mais algum item para o pedido? 📝',
      'Que tal mais alguma coisa? 😊'
    ];

    return response + this.getRandomVariation(continueVariations);
  }

  private handleContactInfo(establishment: any, config: any): string {
    let response = `📞 **Contato - ${establishment.name}**\n\n`;
    
    if (establishment.phone) {
      response += `📱 Telefone: ${establishment.phone}\n`;
    }
    if (establishment.address) {
      response += `📍 Endereço: ${establishment.address}\n`;
    }
    
    if (!establishment.phone && !establishment.address) {
      response += 'Informações de contato não disponíveis no momento.';
    }

    return response;
  }

  private handleGeneral(
    message: string,
    establishment: any,
    config: any,
    context: ConversationContext
  ): string {
    const fallbackVariations = [
      config.fallbackMessage,
      'Não entendi bem. Posso ajudar com nosso cardápio, pedidos ou informações de contato! 😊',
      'Desculpe, não compreendi. Como posso ajudá-lo(a) hoje? 🤔',
    ].filter(Boolean);

    return this.getRandomVariation(fallbackVariations) + this.addMenuPrompt();
  }

  private findProductInMessage(message: string, products: any[]): any {
    return products.find(product =>
      message.includes(product.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );
  }

  private extractQuantity(message: string): number {
    const match = message.match(/(\d+)x|\b(\d+)\s*unidade/i);
    return match ? parseInt(match[1] || match[2]) : 1;
  }

  private extractModifications(message: string): string[] {
    const modifications = [];
    if (message.match(/sem ([\w\s]+)/i)) {
      const match = message.match(/sem ([\w\s]+)/i);
      if (match) modifications.push(`sem ${match[1].trim()}`);
    }
    if (message.match(/com ([\w\s]+)/i)) {
      const match = message.match(/com ([\w\s]+)/i);
      if (match) modifications.push(`com ${match[1].trim()}`);
    }
    return modifications;
  }

  private getRandomVariation(variations: string[]): string {
    const validVariations = variations.filter(v => v && v.trim());
    if (validVariations.length === 0) return 'Como posso ajudar?';
    return validVariations[Math.floor(Math.random() * validVariations.length)];
  }

  private addMenuPrompt(): string {
    return ' Digite "cardápio" para ver nossos produtos! 📋';
  }

  private async getEstablishment(establishmentId: string) {
    return this.prisma.establishment.findUnique({
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
  }

  private async getAgentConfig(establishmentId: string) {
    return this.prisma.agentConfig.findUnique({
      where: { establishmentId }
    });
  }

  private async storeMessage(conversationId: string, userMessage: string, agentResponse: string) {
    await this.prisma.message.createMany({
      data: [
        {
          conversationId,
          whatsappId: `msg_${Date.now()}_user`,
          content: userMessage,
          direction: 'INBOUND'
        },
        {
          conversationId,
          whatsappId: `msg_${Date.now()}_agent`,
          content: agentResponse,
          direction: 'OUTBOUND'
        }
      ]
    });
  }
}