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
import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminOrdersController = class AdminOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAll(query) {
        const data = await this.ordersService.findAll(query);
        return {
            message: 'Orders stream retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.ordersService.findById(id);
        return {
            message: 'Order details retrieved successfully',
            data,
        };
    }
    async updateOrder(id, dto) {
        const data = await this.ordersService.updateStatus(id, dto);
        return {
            message: `Order status transitioned to ${dto.status} successfully`,
            data,
        };
    }
    async updateStatus(id, dto) {
        const data = await this.ordersService.updateStatus(id, dto);
        return {
            message: `Order status transitioned to ${dto.status} successfully`,
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all customer orders across all dispatch stages' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OrderQueryDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve full order details and printable invoice data' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "findById", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update order stage or administrative notes' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateOrder", null);
__decorate([
    Patch(':id/status'),
    ApiOperation({ summary: 'Advance order stage in the Sartorial Lifecycle flow' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateStatus", null);
AdminOrdersController = __decorate([
    ApiTags('Admin - Orders'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Controller('admin/orders'),
    __metadata("design:paramtypes", [OrdersService])
], AdminOrdersController);
export { AdminOrdersController };
//# sourceMappingURL=admin-orders.controller.js.map