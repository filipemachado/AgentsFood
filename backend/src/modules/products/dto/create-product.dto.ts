import { IsString, IsNotEmpty, IsOptional, IsDecimal, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'X-Burger Especial' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Hambúrguer artesanal com bacon, queijo e molho especial' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 24.90 })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 'clxxx123' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? null : value)
  categoryId?: string;
}