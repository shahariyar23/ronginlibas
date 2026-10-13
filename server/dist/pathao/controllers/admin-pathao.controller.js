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
import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PathaoService } from '../services/pathao.service.js';
import { CalculatePriceDto } from '../dto/calculate-price.dto.js';
import { CreateSandboxOrderDto } from '../dto/create-sandbox-order.dto.js';
import { CreateParcelDto } from '../dto/create-parcel.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminPathaoController = class AdminPathaoController {
    pathaoService;
    auditService;
    constructor(pathaoService, auditService) {
        this.pathaoService = pathaoService;
        this.auditService = auditService;
    }
    async testConnection(actor) {
        const result = await this.pathaoService.testConnection();
        await this.auditService.record({
            actor,
            module: 'settings',
            action: 'PATHAO_SANDBOX_CONNECTION_TEST',
            entityType: 'pathao_sandbox',
            entityId: 'sandbox-test',
            summary: `Admin tested Pathao Sandbox connection: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        });
        return result;
    }
    async getStatus() {
        const data = await this.pathaoService.getStatus();
        return {
            success: true,
            data,
        };
    }
    async getCities() {
        const data = await this.pathaoService.getCities();
        return {
            success: true,
            data,
        };
    }
    async getZones(cityId) {
        const data = await this.pathaoService.getZones(cityId);
        return {
            success: true,
            data,
        };
    }
    async getAreas(zoneId) {
        const data = await this.pathaoService.getAreas(zoneId);
        return {
            success: true,
            data,
        };
    }
    async getStores() {
        const data = await this.pathaoService.getStores();
        return {
            success: true,
            data,
        };
    }
    async calculatePrice(dto) {
        const data = await this.pathaoService.calculatePrice(dto);
        return {
            success: true,
            data,
        };
    }
    async createTestOrder(dto, actor) {
        const data = await this.pathaoService.createSandboxOrder(dto);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'PATHAO_SANDBOX_TEST_ORDER_CREATED',
            entityType: 'pathao_sandbox_order',
            entityId: data.consignment_id,
            entityLabel: data.merchant_order_id,
            summary: `Created test sandbox order: Consignment #${data.consignment_id}`,
            after: {
                consignmentId: data.consignment_id,
                merchantOrderId: data.merchant_order_id,
                orderStatus: data.order_status,
            },
        });
        return {
            success: true,
            message: 'Pathao sandbox test order created successfully',
            data,
        };
    }
    async createParcelFromOrder(orderId, options, actor) {
        const result = await this.pathaoService.createParcelFromOrder(orderId, options, actor);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'PATHAO_SANDBOX_PARCEL_BOOKED',
            entityType: 'order',
            entityId: orderId,
            entityLabel: result.order.orderNumber,
            summary: `Booked Pathao Sandbox parcel #${result.parcel.consignment_id} for order ${result.order.orderNumber}`,
            after: {
                courierConsignmentId: result.parcel.consignment_id,
                courierStatus: result.order.courierStatus,
                courierStatusRaw: result.order.courierStatusRaw,
            },
        });
        return {
            success: true,
            message: `Pathao sandbox parcel #${result.parcel.consignment_id} created successfully`,
            data: result,
        };
    }
    async trackOrder(orderId) {
        const data = await this.pathaoService.refreshOrderStatus(orderId);
        return {
            success: true,
            data,
        };
    }
    async refreshOrderStatus(orderId, actor) {
        const data = await this.pathaoService.refreshOrderStatus(orderId);
        await this.auditService.record({
            actor,
            module: 'orders',
            action: 'PATHAO_SANDBOX_STATUS_SYNC',
            entityType: 'order',
            entityId: orderId,
            summary: `Synced Pathao status for ${data.orderNumber}: ${data.courierStatus}`,
        });
        return {
            success: true,
            message: `Pathao status synced: ${data.courierStatus}`,
            data,
        };
    }
};
__decorate([
    Get('test-connection'),
    ApiOperation({ summary: 'Test Pathao Sandbox OAuth connection and API responsiveness' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "testConnection", null);
__decorate([
    Get('status'),
    ApiOperation({ summary: 'Get current Pathao Sandbox configuration status and stores' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "getStatus", null);
__decorate([
    Get('cities'),
    ApiOperation({ summary: 'Fetch list of delivery cities from Pathao Sandbox' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "getCities", null);
__decorate([
    Get('cities/:cityId/zones'),
    ApiOperation({ summary: 'Fetch list of zones for a given city' }),
    __param(0, Param('cityId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "getZones", null);
__decorate([
    Get('zones/:zoneId/areas'),
    ApiOperation({ summary: 'Fetch list of areas for a given zone' }),
    __param(0, Param('zoneId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "getAreas", null);
__decorate([
    Get('stores'),
    ApiOperation({ summary: 'Fetch merchant pickup stores from Pathao Sandbox' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "getStores", null);
__decorate([
    Post('price-plan'),
    ApiOperation({ summary: 'Calculate estimated courier fee on Pathao Sandbox' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculatePriceDto]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "calculatePrice", null);
__decorate([
    Post('test-orders'),
    ApiOperation({ summary: 'Create a standalone test order in Pathao Sandbox (no DB order link)' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSandboxOrderDto, Object]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "createTestOrder", null);
__decorate([
    Post('orders/:orderId/create-parcel'),
    ApiOperation({ summary: 'Book Pathao Sandbox parcel for an existing Rongin Libas order' }),
    __param(0, Param('orderId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateParcelDto, Object]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "createParcelFromOrder", null);
__decorate([
    Get('orders/:orderId/track'),
    ApiOperation({ summary: 'Track consignment status from Pathao Sandbox' }),
    __param(0, Param('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "trackOrder", null);
__decorate([
    Post('orders/:orderId/refresh-status'),
    ApiOperation({ summary: 'Sync and update latest Pathao status for order' }),
    __param(0, Param('orderId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminPathaoController.prototype, "refreshOrderStatus", null);
AdminPathaoController = __decorate([
    ApiTags('Admin - Pathao Courier Sandbox'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('orders', 'settings'),
    Controller('admin/pathao'),
    __metadata("design:paramtypes", [PathaoService,
        AuditService])
], AdminPathaoController);
export { AdminPathaoController };
//# sourceMappingURL=admin-pathao.controller.js.map