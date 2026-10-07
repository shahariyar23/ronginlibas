import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ValidateCouponDto } from '../dto/validate-coupon.dto.js';

@ApiTags('Storefront - Coupons')
@Public()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate discount voucher code against cart total' })
  async validate(@Body() dto: ValidateCouponDto) {
    const data = await this.couponsService.validateCoupon(dto.code, dto.items);
    return {
      message: 'Voucher applied successfully',
      data,
    };
  }
}
