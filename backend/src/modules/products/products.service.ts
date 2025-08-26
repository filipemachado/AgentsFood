import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async findAll(establishmentId: string) {
    const products = await this.prisma.product.findMany({
      where: { establishmentId },
      include: { category: true },
      orderBy: { displayOrder: 'asc' },
    });

    // Transformar campos Decimal para number
    return products.map(product => ({
      ...product,
      price: Number(product.price),
    }));
  }

  async findOne(id: string, establishmentId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, establishmentId },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Transformar campos Decimal para number
    return {
      ...product,
      price: Number(product.price),
    };
  }

  async create(establishmentId: string, createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        establishmentId,
      },
      include: { category: true },
    });

    // Transformar campos Decimal para number
    return {
      ...product,
      price: Number(product.price),
    };
  }

  async update(id: string, establishmentId: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.findOne(id, establishmentId);

    // If image is being updated and old image exists, delete it
    if (updateProductDto.imageUrl && existingProduct.imageUrl && 
        updateProductDto.imageUrl !== existingProduct.imageUrl) {
      this.uploadService.deleteImage(existingProduct.imageUrl);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });

    // Transformar campos Decimal para number
    return {
      ...product,
      price: Number(product.price),
    };
  }

  async remove(id: string, establishmentId: string) {
    const product = await this.findOne(id, establishmentId);

    // Delete associated image if exists
    if (product.imageUrl) {
      this.uploadService.deleteImage(product.imageUrl);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async toggleAvailability(id: string, establishmentId: string) {
    const product = await this.findOne(id, establishmentId);
    
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { available: !product.available },
      include: { category: true },
    });

    // Transformar campos Decimal para number
    return {
      ...updatedProduct,
      price: Number(updatedProduct.price),
    };
  }
}