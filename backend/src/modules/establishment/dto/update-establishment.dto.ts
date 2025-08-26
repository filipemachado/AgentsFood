import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateEstablishmentDto {
  @ApiPropertyOptional({
    description: 'Establishment name',
    example: 'Lanchonete da Maria',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Establishment description',
    example: 'Os melhores lanches da cidade!',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Establishment phone',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Establishment address',
    example: 'Rua das Flores, 123 - Centro',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Whether the establishment is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}