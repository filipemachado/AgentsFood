import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { EstablishmentService } from './establishment.service';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('establishment')
@Controller('establishment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EstablishmentController {
  constructor(private establishmentService: EstablishmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user establishment' })
  @ApiResponse({ status: 200, description: 'Establishment retrieved successfully' })
  async getEstablishment(@CurrentUser('id') userId: string) {
    return this.establishmentService.findByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create initial establishment for user' })
  @ApiResponse({ status: 201, description: 'Establishment created successfully' })
  async createEstablishment(
    @CurrentUser('id') userId: string,
    @Body() createDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentService.createInitial(userId, createDto);
  }

  @Put()
  @ApiOperation({ summary: 'Update establishment information' })
  @ApiResponse({ status: 200, description: 'Establishment updated successfully' })
  async updateEstablishment(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentService.update(userId, updateDto);
  }
}