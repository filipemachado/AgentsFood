import { Injectable, NotFoundException } from '@nestjs/common';
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