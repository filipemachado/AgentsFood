import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let uploadService: UploadService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUploadService = {
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products for an establishment', async () => {
      const establishmentId = 'establishment-id';
      const mockProducts = [
        { id: '1', name: 'Product 1', establishmentId },
        { id: '2', name: 'Product 2', establishmentId },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll(establishmentId);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { establishmentId },
        include: { category: true },
        orderBy: { displayOrder: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const productId = 'product-id';
      const establishmentId = 'establishment-id';
      const mockProduct = { id: productId, name: 'Product 1', establishmentId };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId, establishmentId);

      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, establishmentId },
        include: { category: true },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 'non-existent-id';
      const establishmentId = 'establishment-id';

      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne(productId, establishmentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(productId, establishmentId)).rejects.toThrow(
        'Produto não encontrado',
      );
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const establishmentId = 'establishment-id';
      const createProductDto = {
        name: 'New Product',
        description: 'Product description',
        price: 29.99,
      };
      const mockCreatedProduct = {
        id: 'new-product-id',
        ...createProductDto,
        establishmentId,
      };

      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.create(establishmentId, createProductDto);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          establishmentId,
        },
        include: { category: true },
      });
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = 'product-id';
      const establishmentId = 'establishment-id';
      const updateProductDto = { name: 'Updated Product' };
      const existingProduct = { 
        id: productId, 
        name: 'Old Product', 
        establishmentId,
        imageUrl: null 
      };
      const updatedProduct = { ...existingProduct, ...updateProductDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, establishmentId, updateProductDto);

      expect(service.findOne).toHaveBeenCalledWith(productId, establishmentId);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateProductDto,
        include: { category: true },
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should delete old image when updating with new image', async () => {
      const productId = 'product-id';
      const establishmentId = 'establishment-id';
      const updateProductDto = { imageUrl: 'new-image.jpg' };
      const existingProduct = { 
        id: productId, 
        name: 'Product', 
        establishmentId,
        imageUrl: 'old-image.jpg'
      };
      const updatedProduct = { ...existingProduct, ...updateProductDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      await service.update(productId, establishmentId, updateProductDto);

      expect(uploadService.deleteImage).toHaveBeenCalledWith('old-image.jpg');
    });
  });

  describe('remove', () => {
    it('should delete a product and its image', async () => {
      const productId = 'product-id';
      const establishmentId = 'establishment-id';
      const product = { 
        id: productId, 
        name: 'Product', 
        establishmentId,
        imageUrl: 'product-image.jpg'
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(product as any);
      mockPrismaService.product.delete.mockResolvedValue(product);

      const result = await service.remove(productId, establishmentId);

      expect(service.findOne).toHaveBeenCalledWith(productId, establishmentId);
      expect(uploadService.deleteImage).toHaveBeenCalledWith('product-image.jpg');
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(product);
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle product availability', async () => {
      const productId = 'product-id';
      const establishmentId = 'establishment-id';
      const product = { 
        id: productId, 
        name: 'Product', 
        establishmentId,
        available: true
      };
      const updatedProduct = { ...product, available: false };

      jest.spyOn(service, 'findOne').mockResolvedValue(product as any);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.toggleAvailability(productId, establishmentId);

      expect(service.findOne).toHaveBeenCalledWith(productId, establishmentId);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { available: false },
        include: { category: true },
      });
      expect(result).toEqual(updatedProduct);
    });
  });
});