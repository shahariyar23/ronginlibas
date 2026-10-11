import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CollectionsService } from '../services/collections.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Collections')
@Public()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse active public product collections' })
  async findAll() {
    const data = await this.collectionsService.findAll(false);
    return {
      message: 'Active collections retrieved successfully',
      data,
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve collection details and products by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.collectionsService.findBySlug(slug, false);
    return {
      message: 'Collection retrieved successfully',
      data,
    };
  }
}
