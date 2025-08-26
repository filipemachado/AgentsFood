import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface ConversationContext {
  state: 'greeting' | 'browsing_menu' | 'viewing_category' | 'ordering' | 'confirming_order' | 'idle';
  currentCategory?: string;
  lastInteractionTime: Date;
  greetingShown: boolean;
  menuShown: boolean;
}

export interface UserPreferences {
  favoriteProducts: string[];
  allergies?: string[];
  preferredModifications?: Record<string, string[]>;
}

export interface CurrentOrder {
  items: OrderItem[];
  totalValue: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  modifications?: string[];
  notes?: string;
}

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(
    whatsappId: string,
    establishmentId: string,
    customerPhone: string,
    customerName?: string
  ) {
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        whatsappId_establishmentId: {
          whatsappId,
          establishmentId
        }
      }
    });

    if (!conversation) {
      const defaultContext = {
        state: 'greeting',
        lastInteractionTime: new Date().toISOString(),
        greetingShown: false,
        menuShown: false
      };

      conversation = await this.prisma.conversation.create({
        data: {
          whatsappId,
          establishmentId,
          customerPhone,
          customerName,
          currentContext: defaultContext as any,
          preferences: {} as any,
          currentOrder: null
        }
      });
    }

    return conversation;
  }

  async updateConversationContext(
    conversationId: string,
    context: Partial<ConversationContext>
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) return null;

    const currentContext = (conversation.currentContext as any) || {
      state: 'greeting',
      lastInteractionTime: new Date().toISOString(),
      greetingShown: false,
      menuShown: false
    };

    const updatedContext = {
      ...currentContext,
      ...context,
      lastInteractionTime: new Date().toISOString()
    };

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        currentContext: updatedContext as any,
        lastMessageAt: new Date()
      }
    });
  }

  async updateCurrentOrder(conversationId: string, order: CurrentOrder | null) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        currentOrder: order as any
      }
    });
  }

  async addToOrder(
    conversationId: string,
    productId: string,
    productName: string,
    price: number,
    quantity: number = 1,
    modifications?: string[],
    notes?: string
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) return null;

    const currentOrder = (conversation.currentOrder as any) || {
      items: [],
      totalValue: 0
    };

    const existingItemIndex = currentOrder.items.findIndex(
      item => item.productId === productId && 
      JSON.stringify(item.modifications) === JSON.stringify(modifications)
    );

    if (existingItemIndex >= 0) {
      currentOrder.items[existingItemIndex].quantity += quantity;
    } else {
      currentOrder.items.push({
        productId,
        productName,
        quantity,
        price,
        modifications,
        notes
      });
    }

    currentOrder.totalValue = currentOrder.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );

    return this.updateCurrentOrder(conversationId, currentOrder);
  }

  async clearOrder(conversationId: string) {
    return this.updateCurrentOrder(conversationId, null);
  }

  getContext(conversation: any): ConversationContext {
    const context = conversation.currentContext as any;
    return {
      state: context?.state || 'greeting',
      lastInteractionTime: context?.lastInteractionTime ? new Date(context.lastInteractionTime) : new Date(),
      greetingShown: context?.greetingShown || false,
      menuShown: context?.menuShown || false,
      currentCategory: context?.currentCategory
    };
  }

  getCurrentOrder(conversation: any): CurrentOrder | null {
    return conversation.currentOrder as CurrentOrder || null;
  }

  isRecentInteraction(context: ConversationContext, minutesThreshold: number = 30): boolean {
    const now = new Date();
    const lastInteraction = new Date(context.lastInteractionTime);
    const diffMinutes = (now.getTime() - lastInteraction.getTime()) / (1000 * 60);
    return diffMinutes < minutesThreshold;
  }
}