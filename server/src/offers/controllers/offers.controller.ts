import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffersService } from '../services/offers.service.js';
import { QueryOffersDto } from '../dto/query-offers.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Offers')
@Public()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all active customer-facing offers, products, coupons, and countdown timer',
  })
  async getStorefrontOffers(@Query() query: QueryOffersDto) {
    const data = await this.offersService.getStorefrontOffers(query);
    return {
      message: 'Active offers retrieved successfully',
      data,
    };
  }
}
