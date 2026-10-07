import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { ProductsService } from '../services/products.service.js';

@ApiTags('Products')
@Public()
@Controller('search')
export class ProductSearchController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search the active product catalogue' })
  async searchProducts(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query);
    return { message: 'Product search completed successfully', data };
  }
}
