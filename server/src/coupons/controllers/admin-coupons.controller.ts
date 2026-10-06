import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List all promotional coupons and vouchers' })
  async findAll() {
    const data = await this.couponsService.findAll();
    return {
      message: 'Vouchers retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new promotional coupon code' })
  async create(@Body() dto: CreateCouponDto) {
    const data = await this.couponsService.create(dto);
    return {
      message: 'Voucher created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon properties or deactivation' })
  async update(@Param('id') id: string, @Body() body: Partial<CreateCouponDto>) {
    const data = await this.couponsService.update(id, body);
    return {
      message: 'Voucher updated successfully',
      data,
    };
  }
}
