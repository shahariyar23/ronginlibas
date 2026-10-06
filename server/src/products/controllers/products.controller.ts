import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Products')
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse active luxury apparel catalogue' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query, false);
    return {
      message: 'Catalogue retrieved successfully',
      data,
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve garment product details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);
    return {
      message: 'Garment retrieved successfully',
      data,
    };
  }
}
