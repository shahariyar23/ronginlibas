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

  @Get('filters')
  @ApiOperation({ summary: 'Retrieve dynamic filters for the active product catalogue' })
  async getFilters(@Query() query: ProductQueryDto) {
    return {
      message: 'Product filters retrieved successfully',
      data: await this.productsService.getFilters(query),
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve garment product details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);
    const isRedirect = Boolean((data as any)?.isRedirect);
    const redirectTargetSlug = (data as any)?.redirectTargetSlug;
    return {
      message: isRedirect ? 'Garment relocated' : 'Garment retrieved successfully',
      data,
      redirect: isRedirect,
      redirectTargetSlug,
    };
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Retrieve related active products' })
  async findRelated(@Param('slug') slug: string) {
    return {
      message: 'Related products retrieved successfully',
      data: await this.productsService.findRelated(slug, 'RELATED'),
    };
  }

}

