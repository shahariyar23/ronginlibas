import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('coupons')
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly auditService: AuditService,
  ) {}

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
  async create(@Body() dto: CreateCouponDto, @CurrentUser() actor: AdminAuditActor) {
    const data = await this.couponsService.create(dto);
    await this.auditService.record({
      actor,
      module: 'coupons',
      action: 'COUPON_CREATED',
      entityType: 'coupon',
      entityId: data.id,
      entityLabel: data.code,
      summary: `Created coupon ${data.code}`,
      after: data,
    });
    return {
      message: 'Voucher created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon properties or deactivation' })
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateCouponDto>,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.couponsService.findById(id);
    const data = await this.couponsService.update(id, body);
    await this.auditService.record({
      actor,
      module: 'coupons',
      action: 'COUPON_UPDATED',
      entityType: 'coupon',
      entityId: data.id,
      entityLabel: data.code,
      summary: `Updated coupon ${data.code}`,
      before,
      after: data,
    });
    return {
      message: 'Voucher updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a promotional coupon code' })
  async remove(@Param('id') id: string, @CurrentUser() actor: AdminAuditActor) {
    const before = await this.couponsService.findById(id);
    const data = await this.couponsService.remove(id);
    await this.auditService.record({
      actor,
      module: 'coupons',
      action: 'COUPON_DELETED',
      entityType: 'coupon',
      entityId: id,
      entityLabel: before.code,
      summary: `Deleted coupon ${before.code}`,
      before,
    });
    return {
      message: 'Voucher deleted successfully',
      data,
    };
  }
}
