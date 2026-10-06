import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Categories')
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active apparel categories and capsules' })
  async findAll() {
    const data = await this.categoriesService.findAll(false);
    return {
      message: 'Categories retrieved successfully',
      data,
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve category details and featured silhouettes' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return {
      message: 'Category retrieved successfully',
      data,
    };
  }
}
