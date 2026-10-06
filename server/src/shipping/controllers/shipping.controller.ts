import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from '../services/shipping.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Shipping (Prepared)')
@Public()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('zones')
  @ApiOperation({ summary: 'List Bangladesh fulfillment delivery grid zones and rates' })
  async getZones() {
    const data = await this.shippingService.getDeliveryZones();
    return {
      message: 'Delivery zones retrieved successfully',
      data,
    };
  }
}
