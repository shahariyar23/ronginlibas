import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { OrderAccessDto } from '../dto/order-access.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { OrdersService } from '../services/orders.service.js';

@ApiTags('Orders')
@UseGuards(OptionalCustomerAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Place an order using server-side pricing and inventory validation' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser('id') customerId?: string) {
    return {
      message: 'Order placed successfully',
      data: await this.ordersService.create(dto, customerId),
    };
  }

  @Get('my-orders')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated customer order history' })
  async getMyOrders(
    @CurrentUser('id') customerId: string,
    @Query() query: OrderQueryDto,
  ) {
    return {
      message: 'Customer orders retrieved successfully',
      data: await this.ordersService.findCustomerOrders(customerId, query),
    };
  }

  @Get('my-orders/:orderNumber')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve an order belonging to the authenticated customer' })
  async getMyOrder(
    @CurrentUser('id') customerId: string,
    @Param('orderNumber') orderNumber: string,
  ) {
    return {
      message: 'Order retrieved successfully',
      data: await this.ordersService.findCustomerOrder(customerId, orderNumber),
    };
  }

  @Get(':orderNumber/tracking')
  @ApiOperation({ summary: 'Track an owned customer order or verify a guest order' })
  async track(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser('id') customerId: string | undefined,
    @Query() query: OrderAccessDto,
  ) {
    return {
      message: 'Order tracking retrieved successfully',
      data: await this.ordersService.getTracking(
        orderNumber,
        customerId,
        query.phone,
        query.trackingToken,
      ),
    };
  }

  @Get(':orderNumber/invoice')
  @ApiProduces('application/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="rongin-libas-invoice.pdf"')
  @ApiOperation({ summary: 'Download an owned order invoice as PDF' })
  async invoice(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser('id') customerId: string | undefined,
    @Query() query: OrderAccessDto,
    @Res() response: Response,
  ) {
    const pdf = await this.ordersService.generateInvoice(
      orderNumber,
      customerId,
      query.phone,
      query.trackingToken,
    );
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${orderNumber}-invoice.pdf"`,
    );
    response.send(pdf);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Retrieve a customer-safe order confirmation' })
  async getOrder(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser('id') customerId: string | undefined,
    @Query() query: OrderAccessDto,
  ) {
    return {
      message: 'Order retrieved successfully',
      data: await this.ordersService.getOrderForCustomerAccess(
        orderNumber,
        customerId,
        query.phone,
        query.trackingToken,
      ),
    };
  }
}
