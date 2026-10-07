import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { StorefrontService } from './storefront.service.js';

@ApiTags('Storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('home')
  @ApiOperation({ summary: 'Load dynamic customer storefront homepage data' })
  async getHome() {
    return {
      message: 'Storefront homepage retrieved successfully',
      data: await this.storefrontService.getHome(),
    };
  }
}
