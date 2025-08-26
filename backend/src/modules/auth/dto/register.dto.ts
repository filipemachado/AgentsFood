import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'User email',
    example: 'owner@restaurant.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Establishment name',
    example: 'Lanchonete do João',
  })
  @IsOptional()
  @IsString()
  establishmentName?: string;

  @ApiPropertyOptional({
    description: 'Establishment description',
    example: 'Os melhores lanches da cidade',
  })
  @IsOptional()
  @IsString()
  establishmentDescription?: string;

  @ApiPropertyOptional({
    description: 'Establishment phone',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  establishmentPhone?: string;
}