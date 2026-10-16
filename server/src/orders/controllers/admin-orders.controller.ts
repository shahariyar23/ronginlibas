import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { CreateAdminOrderDto } from '../dto/create-admin-order.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';

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

  @Post()
  @ApiOperation({ summary: 'Create manual order by admin or staff' })
  async createOrder(
    @Body() dto: CreateAdminOrderDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.ordersService.createByAdmin(dto, actor);
    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'ORDER_CREATED_BY_ADMIN',
      entityType: 'order',
      entityId: data.id,
      entityLabel: data.orderNumber,
      summary: `Created order ${data.orderNumber} via ${dto.source || 'ADMIN'} for ${data.customer ? `${data.customer.firstName} ${data.customer.lastName || ''}`.trim() : data.guestName || 'Walk-in Customer'}`,
      after: {
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        status: data.status,
        paymentStatus: data.paymentStatus,
        source: data.source,
      },
    });
    return {
      message: 'Order created successfully',
      data,
    };
  }

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
      message: dto.status
        ? `Order status transitioned to ${dto.status} successfully`
        : 'Order updated successfully',
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
      message: dto.status
        ? `Order status transitioned to ${dto.status} successfully`
        : 'Order updated successfully',
      data,
    };
  }

  @Get(':id/invoice')
  @ApiProduces('application/pdf')
  @ApiOperation({ summary: 'Download full order tax invoice as PDF by Admin' })
  async downloadInvoice(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const { buffer, invoiceNumber } = await this.ordersService.generateInvoiceForAdmin(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="Rongin-Libas-Invoice-${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '')}.pdf"`,
    );
    response.send(buffer);
  }
}
