import { IsString, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Lanches'
  })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome não pode exceder 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição da categoria',
    example: 'Lanches tradicionais e especiais'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Descrição não pode exceder 500 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição da categoria',
    example: 1
  })
  @IsOptional()
  @IsNumber({}, { message: 'Ordem de exibição deve ser um número' })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Se a categoria está ativa',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}