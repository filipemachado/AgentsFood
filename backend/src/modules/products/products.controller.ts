import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso' })
  async findAll(@CurrentUser('establishment.id') establishmentId: string) {
    return this.productsService.findAll(establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    return this.productsService.findOne(id, establishmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    return this.productsService.create(establishmentId, createProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    return this.productsService.update(id, establishmentId, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 204, description: 'Produto deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    await this.productsService.remove(id, establishmentId);
  }

  @Patch(':id/toggle-availability')
  @ApiOperation({ summary: 'Alternar disponibilidade do produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Disponibilidade alterada com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async toggleAvailability(
    @Param('id') id: string,
    @CurrentUser('establishment.id') establishmentId: string,
  ) {
    return this.productsService.toggleAvailability(id, establishmentId);
  }
}