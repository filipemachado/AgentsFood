import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiBody 
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ status: 200, description: 'Categorias listadas com sucesso' })
  async findAll(@CurrentUser('establishment.id') establishmentId: string) {
    return this.categoriesService.findAll(establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string
  ) {
    return this.categoriesService.findOne(id, establishmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou categoria já existe' })
  @ApiBody({ type: CreateCategoryDto })
  async create(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    return this.categoriesService.create(establishmentId, createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nome já existe' })
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, establishmentId, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 400, description: 'Categoria possui produtos vinculados' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string
  ) {
    return this.categoriesService.remove(id, establishmentId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Ativar/desativar categoria' })
  @ApiResponse({ status: 200, description: 'Status da categoria alterado com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async toggleActive(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string
  ) {
    return this.categoriesService.toggleActive(id, establishmentId);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar categorias' })
  @ApiResponse({ status: 200, description: 'Ordem das categorias atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              displayOrder: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async reorder(
    @CurrentUser('establishment.id') establishmentId: string,
    @Body('categories') categories: { id: string; displayOrder: number }[]
  ) {
    return this.categoriesService.reorder(establishmentId, categories);
  }
}