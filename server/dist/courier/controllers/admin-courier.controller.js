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
import { Controller, Get, Post, Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service.js';
import { CreateShipmentDto } from '../dto/create-shipment.dto.js';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminCourierController = class AdminCourierController {
    shipmentService;
    auditService;
    constructor(shipmentService, auditService) {
        this.shipmentService = shipmentService;
        this.auditService = auditService;
    }
    async healthCheck() {
        const data = await this.shipmentService.healthCheck();
        return {
            success: true,
            data,
        };
    }
    async getBalance() {
        const data = await this.shipmentService.getBalance();
        return {
            success: true,
            data,
        };
    }
    async createShipment(orderId, dto, actor) {
        const data = await this.shipmentService.createShipmentForOrder(orderId, dto, actor);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'COURIER_SHIPMENT_CREATED',
            entityType: 'shipment',
            entityId: data.id,
            entityLabel: data.orderNumber,
            summary: `Created ${data.provider} shipment #${data.consignmentId || data.id} for order ${data.orderNumber} (Tracking: ${data.trackingCode})`,
            after: {
                provider: data.provider,
                consignmentId: data.consignmentId,
                trackingCode: data.trackingCode,
                codAmount: data.codAmount,
                status: data.status,
            },
        });
        return {
            success: true,
            message: `Shipment booked successfully with ${data.provider}. Consignment #${data.consignmentId}`,
            data,
        };
    }
    async getShipment(orderId) {
        const data = await this.shipmentService.getShipmentByOrderId(orderId);
        return {
            success: true,
            data,
        };
    }
    async refreshStatus(orderId, actor) {
        const data = await this.shipmentService.refreshShipmentStatus(orderId, actor);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'COURIER_STATUS_SYNC',
            entityType: 'shipment',
            entityId: data.id,
            entityLabel: data.orderNumber,
            summary: `Synced courier status for order ${data.orderNumber}: ${data.providerStatus} (${data.status})`,
            after: {
                status: data.status,
                providerStatus: data.providerStatus,
                lastSyncedAt: data.lastSyncedAt,
            },
        });
        return {
            success: true,
            message: `Courier status synced: ${data.providerStatus}`,
            data,
        };
    }
    async createReturnRequest(orderId, dto, actor) {
        const data = await this.shipmentService.createReturnRequest(orderId, dto, actor);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'COURIER_RETURN_REQUESTED',
            entityType: 'order',
            entityId: orderId,
            summary: `Requested courier return: ${dto.reason || 'Doorstep return'}`,
        });
        return {
            success: data.success,
            message: data.message,
            data,
        };
    }
    async getStatusByCid(consignmentId) {
        const data = await this.shipmentService.getStatusByConsignmentId(consignmentId);
        return {
            success: true,
            data,
        };
    }
    async getStatusByInvoice(invoice) {
        const data = await this.shipmentService.getStatusByInvoice(invoice);
        return {
            success: true,
            data,
        };
    }
    async getStatusByTrackingCode(trackingCode) {
        const data = await this.shipmentService.getStatusByTrackingCode(trackingCode);
        return {
            success: true,
            data,
        };
    }
};
__decorate([
    Get('courier/health'),
    ApiOperation({ summary: 'Health check for courier logistics integration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "healthCheck", null);
__decorate([
    Get('courier/balance'),
    ApiOperation({ summary: 'Fetch merchant account balance from active courier provider' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "getBalance", null);
__decorate([
    Post('orders/:orderId/shipment'),
    ApiOperation({ summary: 'Create parcel shipment for an order with active courier provider' }),
    __param(0, Param('orderId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateShipmentDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "createShipment", null);
__decorate([
    Get('orders/:orderId/shipment'),
    ApiOperation({ summary: 'Retrieve shipment details and audit trail for an order' }),
    __param(0, Param('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "getShipment", null);
__decorate([
    Post('orders/:orderId/shipment/refresh-status'),
    ApiOperation({ summary: 'Sync latest delivery status from courier gateway' }),
    __param(0, Param('orderId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "refreshStatus", null);
__decorate([
    Post('orders/:orderId/shipment/return'),
    ApiOperation({ summary: 'Book courier return request for an order consignment' }),
    __param(0, Param('orderId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateReturnRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "createReturnRequest", null);
__decorate([
    Get('courier/status-by-cid/:consignmentId'),
    ApiOperation({ summary: 'Look up live status by courier consignment ID' }),
    __param(0, Param('consignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "getStatusByCid", null);
__decorate([
    Get('courier/status-by-invoice/:invoice'),
    ApiOperation({ summary: 'Look up live status by provider invoice number' }),
    __param(0, Param('invoice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "getStatusByInvoice", null);
__decorate([
    Get('courier/status-by-tracking/:trackingCode'),
    ApiOperation({ summary: 'Look up live status by tracking code' }),
    __param(0, Param('trackingCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCourierController.prototype, "getStatusByTrackingCode", null);
AdminCourierController = __decorate([
    ApiTags('Admin - Courier Logistics'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('orders'),
    Controller('admin'),
    __metadata("design:paramtypes", [ShipmentService,
        AuditService])
], AdminCourierController);
export { AdminCourierController };
//# sourceMappingURL=admin-courier.controller.js.map