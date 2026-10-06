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
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(dto, customerId) {
        const data = await this.ordersService.create(dto, customerId);
        return {
            message: 'Order placed successfully',
            data,
        };
    }
    async getMyOrders(customerId) {
        const data = await this.ordersService.findCustomerOrders(customerId);
        return {
            message: 'Customer orders retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.ordersService.findById(id);
        return {
            message: 'Order retrieved successfully',
            data,
        };
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Place a new garment consignment order' }),
    __param(0, Body()),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrderDto, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    Get('my-orders'),
    ApiOperation({ summary: 'List authenticated customer orders' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve specific order details and tracking' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findById", null);
OrdersController = __decorate([
    ApiTags('Storefront - Orders'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('orders'),
    __metadata("design:paramtypes", [OrdersService])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map