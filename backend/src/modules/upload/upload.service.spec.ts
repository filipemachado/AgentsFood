import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';

jest.mock('fs');

describe('UploadService', () => {
  let service: UploadService;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation();

      const result = await service.uploadImage(mockFile);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        mockFile.buffer,
      );
      expect(result).toMatch(/^\/uploads\/\d+-\w+\.jpg$/);
    });

    it('should throw BadRequestException if no file provided', async () => {
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        'Nenhum arquivo foi enviado',
      );
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const mockFile = {
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024,
        buffer: Buffer.from('test-data'),
      } as Express.Multer.File;

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        'Tipo de arquivo não suportado. Use JPG, PNG ou WebP',
      );
    });

    it('should throw BadRequestException for file too large', async () => {
      const mockFile = {
        originalname: 'large-image.jpg',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
        buffer: Buffer.from('large-image-data'),
      } as Express.Multer.File;

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        'Arquivo muito grande. Tamanho máximo: 5MB',
      );
    });

    it('should create upload directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();

      new UploadService();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true },
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete existing image', () => {
      const imagePath = '/uploads/test-image.jpg';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation();

      service.deleteImage(imagePath);

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('test-image.jpg'),
      );
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('test-image.jpg'),
      );
    });

    it('should handle non-existent image gracefully', () => {
      const imagePath = '/uploads/non-existent.jpg';

      mockFs.existsSync.mockReturnValue(false);

      expect(() => service.deleteImage(imagePath)).not.toThrow();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle invalid image path gracefully', () => {
      const imagePath = '/invalid/path/image.jpg';

      expect(() => service.deleteImage(imagePath)).not.toThrow();
    });

    it('should handle errors during deletion gracefully', () => {
      const imagePath = '/uploads/test-image.jpg';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Mock console.error to avoid output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw error
      expect(() => service.deleteImage(imagePath)).not.toThrow();

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should handle null or empty image path', () => {
      expect(() => service.deleteImage(null as any)).not.toThrow();
      expect(() => service.deleteImage('')).not.toThrow();
    });
  });
});