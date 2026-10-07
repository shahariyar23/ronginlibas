import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  async updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.ordersService.updateStatus(id, dto);
    return {
      message: `Order status transitioned to ${dto.status} successfully`,
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance order stage in the Sartorial Lifecycle flow' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.ordersService.updateStatus(id, dto);
    return {
      message: `Order status transitioned to ${dto.status} successfully`,
      data,
    };
  }
}
