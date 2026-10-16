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
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
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
import { AuditService } from '../../audit/audit.service.js';
let AdminOrdersController = class AdminOrdersController {
    ordersService;
    auditService;
    constructor(ordersService, auditService) {
        this.ordersService = ordersService;
        this.auditService = auditService;
    }
    async createOrder(dto, actor) {
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
    async updateOrder(id, dto, actor) {
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
    async updateStatus(id, dto, actor) {
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
    async downloadInvoice(id, response) {
        const { buffer, invoiceNumber } = await this.ordersService.generateInvoiceForAdmin(id);
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="Rongin-Libas-Invoice-${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '')}.pdf"`);
        response.send(buffer);
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Create manual order by admin or staff' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAdminOrderDto, Object]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "createOrder", null);
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
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateOrder", null);
__decorate([
    Patch(':id/status'),
    ApiOperation({ summary: 'Advance order stage in the Sartorial Lifecycle flow' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateStatus", null);
__decorate([
    Get(':id/invoice'),
    ApiProduces('application/pdf'),
    ApiOperation({ summary: 'Download full order tax invoice as PDF by Admin' }),
    __param(0, Param('id')),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "downloadInvoice", null);
AdminOrdersController = __decorate([
    ApiTags('Admin - Orders'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('orders'),
    Controller('admin/orders'),
    __metadata("design:paramtypes", [OrdersService,
        AuditService])
], AdminOrdersController);
export { AdminOrdersController };
//# sourceMappingURL=admin-orders.controller.js.map