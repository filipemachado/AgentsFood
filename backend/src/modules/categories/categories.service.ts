import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(establishmentId: string) {
    return this.prisma.category.findMany({
      where: { establishmentId },
      include: { 
        _count: { select: { products: true } }
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string, establishmentId: string) {
    const category = await this.prisma.category.findFirst({
      where: { 
        id,
        establishmentId 
      },
      include: { 
        _count: { select: { products: true } },
        products: {
          where: { available: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async create(establishmentId: string, createCategoryDto: CreateCategoryDto) {
    // Check for duplicate name in the same establishment
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        establishmentId
      }
    });

    if (existingCategory) {
      throw new BadRequestException('Já existe uma categoria com este nome');
    }

    // Get next display order if not provided
    let displayOrder = createCategoryDto.displayOrder;
    if (displayOrder === undefined) {
      const lastCategory = await this.prisma.category.findFirst({
        where: { establishmentId },
        orderBy: { displayOrder: 'desc' }
      });
      displayOrder = (lastCategory?.displayOrder || 0) + 1;
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        displayOrder,
        establishmentId,
      },
      include: { 
        _count: { select: { products: true } }
      }
    });
  }

  async update(id: string, establishmentId: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, establishmentId }
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          establishmentId,
          NOT: { id }
        }
      });

      if (existingCategory) {
        throw new BadRequestException('Já existe uma categoria com este nome');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: { 
        _count: { select: { products: true } }
      }
    });
  }

  async remove(id: string, establishmentId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, establishmentId },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new BadRequestException(
        `Não é possível excluir a categoria "${category.name}" pois ela possui ${category._count.products} produto(s) vinculado(s). Remova os produtos primeiro.`
      );
    }

    await this.prisma.category.delete({
      where: { id }
    });

    return { message: 'Categoria excluída com sucesso' };
  }

  async toggleActive(id: string, establishmentId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, establishmentId }
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.category.update({
      where: { id },
      data: { active: !category.active },
      include: { 
        _count: { select: { products: true } }
      }
    });
  }

  async reorder(establishmentId: string, categoryOrders: { id: string; displayOrder: number }[]) {
    // Validate that all categories belong to the establishment
    const categoryIds = categoryOrders.map(item => item.id);
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        establishmentId
      }
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Uma ou mais categorias não foram encontradas');
    }

    // Update display orders in a transaction
    const updates = categoryOrders.map(({ id, displayOrder }) =>
      this.prisma.category.update({
        where: { id },
        data: { displayOrder }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Ordem das categorias atualizada com sucesso' };
  }
}