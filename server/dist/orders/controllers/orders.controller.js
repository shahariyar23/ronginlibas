var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Header, Param, Post, Query, Res, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags, } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { OrderAccessDto } from '../dto/order-access.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { OrdersService } from '../services/orders.service.js';
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(dto, customerId) {
        return {
            message: 'Order placed successfully',
            data: await this.ordersService.create(dto, customerId),
        };
    }
    async getMyOrders(customerId, query) {
        return {
            message: 'Customer orders retrieved successfully',
            data: await this.ordersService.findCustomerOrders(customerId, query),
        };
    }
    async getMyOrder(customerId, orderNumber) {
        return {
            message: 'Order retrieved successfully',
            data: await this.ordersService.findCustomerOrder(customerId, orderNumber),
        };
    }
    async track(orderNumber, customerId, query) {
        return {
            message: 'Order tracking retrieved successfully',
            data: await this.ordersService.getTracking(orderNumber, customerId, query.phone, query.trackingToken),
        };
    }
    async invoice(orderNumber, customerId, query, response) {
        const { buffer, invoiceNumber } = await this.ordersService.generateInvoice(orderNumber, customerId, query.phone, query.trackingToken);
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="Rongin-Libas-Invoice-${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '')}.pdf"`);
        response.send(buffer);
    }
    async getOrder(orderNumber, customerId, query) {
        return {
            message: 'Order retrieved successfully',
            data: await this.ordersService.getOrderForCustomerAccess(orderNumber, customerId, query.phone, query.trackingToken),
        };
    }
    async cancelOrder(orderNumber, customerId, dto) {
        return {
            message: 'Order cancelled successfully',
            data: await this.ordersService.cancelUnpaidOrder(orderNumber, customerId, dto.phone, dto.trackingToken),
        };
    }
};
__decorate([
    Post(),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Place an order using server-side pricing and inventory validation' }),
    __param(0, Body()),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrderDto, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    Get('my-orders'),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'List the authenticated customer order history' }),
    __param(0, CurrentUser('id')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, OrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    Get('my-orders/:orderNumber'),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Retrieve an order belonging to the authenticated customer' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrder", null);
__decorate([
    Get(':orderNumber/tracking'),
    ApiOperation({ summary: 'Track an owned customer order or verify a guest order' }),
    __param(0, Param('orderNumber')),
    __param(1, CurrentUser('id')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, OrderAccessDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "track", null);
__decorate([
    Get(':orderNumber/invoice'),
    ApiProduces('application/pdf'),
    Header('Content-Type', 'application/pdf'),
    Header('Content-Disposition', 'attachment; filename="rongin-libas-invoice.pdf"'),
    ApiOperation({ summary: 'Download an owned order invoice as PDF' }),
    __param(0, Param('orderNumber')),
    __param(1, CurrentUser('id')),
    __param(2, Query()),
    __param(3, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, OrderAccessDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "invoice", null);
__decorate([
    Get(':orderNumber'),
    ApiOperation({ summary: 'Retrieve a customer-safe order confirmation' }),
    __param(0, Param('orderNumber')),
    __param(1, CurrentUser('id')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, OrderAccessDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrder", null);
__decorate([
    Post(':orderNumber/cancel'),
    ApiOperation({ summary: 'Cancel order by patron within 6-hour window while in PENDING status' }),
    __param(0, Param('orderNumber')),
    __param(1, CurrentUser('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, OrderAccessDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
OrdersController = __decorate([
    ApiTags('Orders'),
    UseGuards(OptionalCustomerAuthGuard),
    Controller('orders'),
    __metadata("design:paramtypes", [OrdersService])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map