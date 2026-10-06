import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Storefront - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new garment consignment order' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser('id') customerId: string) {
    const data = await this.ordersService.create(dto, customerId);
    return {
      message: 'Order placed successfully',
      data,
    };
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'List authenticated customer orders' })
  async getMyOrders(@CurrentUser('id') customerId: string) {
    const data = await this.ordersService.findCustomerOrders(customerId);
    return {
      message: 'Customer orders retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve specific order details and tracking' })
  async findById(@Param('id') id: string) {
    const data = await this.ordersService.findById(id);
    return {
      message: 'Order retrieved successfully',
      data,
    };
  }
}
