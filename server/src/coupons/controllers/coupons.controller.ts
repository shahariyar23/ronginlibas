import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Coupons')
@Public()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate discount voucher code against cart total' })
  async validate(@Body() body: { code: string; cartTotal: number }) {
    const data = await this.couponsService.validateCoupon(body.code, body.cartTotal);
    return {
      message: 'Voucher applied successfully',
      data,
    };
  }
}
