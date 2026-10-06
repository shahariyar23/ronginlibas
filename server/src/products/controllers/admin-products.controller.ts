import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products with admin filters, stock states, and SKUs' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query, true);
    return {
      message: 'Admin products retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new garment silhouette with variants and lookbook media' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return {
      message: 'Product created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product specifications or variants' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(id, dto);
    return {
      message: 'Product updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Deactivate product from catalog' })
  async delete(@Param('id') id: string) {
    const data = await this.productsService.delete(id);
    return {
      message: 'Product archived successfully',
      data,
    };
  }
}
