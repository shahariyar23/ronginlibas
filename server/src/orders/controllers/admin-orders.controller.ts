import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all customer orders across all dispatch stages' })
  async findAll(@Query() query: OrderQueryDto) {
    const data = await this.ordersService.findAll(query);
    return {
      message: 'Orders stream retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve full order details and printable invoice data' })
  async findById(@Param('id') id: string) {
    const data = await this.ordersService.findById(id);
    return {
      message: 'Order details retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order stage or administrative notes' })
  async updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.ordersService.findById(id);
    const data = await this.ordersService.updateStatus(id, dto);
    await this.auditService.record({
      actor,
      module: 'orders',
      action: before.status === data.status ? 'ORDER_UPDATED' : 'ORDER_STATUS_CHANGED',
      entityType: 'order',
      entityId: data.id,
      entityLabel: data.orderNumber,
      summary: before.status === data.status
        ? `Updated order ${data.orderNumber}`
        : `Changed order ${data.orderNumber} from ${before.status} to ${data.status}`,
      before: { status: before.status, adminNotes: before.adminNotes },
      after: { status: data.status, adminNotes: data.adminNotes },
    });
    return {
      message: `Order status transitioned to ${dto.status} successfully`,
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance order stage in the Sartorial Lifecycle flow' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.ordersService.findById(id);
    const data = await this.ordersService.updateStatus(id, dto);
    await this.auditService.record({
      actor,
      module: 'orders',
      action: before.status === data.status ? 'ORDER_UPDATED' : 'ORDER_STATUS_CHANGED',
      entityType: 'order',
      entityId: data.id,
      entityLabel: data.orderNumber,
      summary: before.status === data.status
        ? `Updated order ${data.orderNumber}`
        : `Changed order ${data.orderNumber} from ${before.status} to ${data.status}`,
      before: { status: before.status, adminNotes: before.adminNotes },
      after: { status: data.status, adminNotes: data.adminNotes },
    });
    return {
      message: `Order status transitioned to ${dto.status} successfully`,
      data,
    };
  }
}
