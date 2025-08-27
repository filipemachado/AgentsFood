import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';

@Injectable()
export class EstablishmentService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { userId },
      include: {
        agentConfig: true,
        _count: {
          select: {
            products: true,
            categories: true,
          },
        },
      },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    return establishment;
  }

  async createInitial(userId: string, createDto: UpdateEstablishmentDto) {
    // Check if user already has an establishment
    const existingEstablishment = await this.prisma.establishment.findUnique({
      where: { userId }
    });

    if (existingEstablishment) {
      throw new BadRequestException('User already has an establishment');
    }

    // Create establishment with default values
    const establishment = await this.prisma.establishment.create({
      data: {
        ...createDto,
        userId,
        active: true,
      },
      include: {
        agentConfig: true,
      },
    });

    // Create default agent config
    await this.prisma.agentConfig.create({
      data: {
        establishmentId: establishment.id,
        welcomeMessage: "Olá! Bem-vindo ao nosso cardápio! Como posso ajudá-lo hoje?",
        tone: "friendly",
        language: "pt-BR",
        maxResponseLength: 300,
        enabledFeatures: {
          menu: true,
          prices: true,
          availability: true,
          suggestions: true
        }
      }
    });

    return establishment;
  }

  async update(userId: string, updateDto: UpdateEstablishmentDto) {
    const establishment = await this.findByUserId(userId);

    return this.prisma.establishment.update({
      where: { id: establishment.id },
      data: updateDto,
      include: {
        agentConfig: true,
      },
    });
  }

  async updateWhatsAppConfig(
    userId: string,
    config: {
      whatsappPhoneNumberId?: string;
      whatsappBusinessAccountId?: string;
      whatsappToken?: string;
    }
  ) {
    const establishment = await this.findByUserId(userId);

    return this.prisma.establishment.update({
      where: { id: establishment.id },
      data: config,
    });
  }
}