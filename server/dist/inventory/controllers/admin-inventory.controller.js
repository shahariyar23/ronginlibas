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
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminInventoryController = class AdminInventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventoryList(query) {
        const data = await this.inventoryService.getInventoryList(query);
        return {
            message: 'Inventory ledger retrieved successfully',
            data,
        };
    }
    async adjustStock(dto, userId) {
        const data = await this.inventoryService.adjustStock(dto, userId);
        return {
            message: 'Stock adjusted and audit transaction logged successfully',
            data,
        };
    }
    async getTransactionHistory(variantId) {
        const data = await this.inventoryService.getTransactionHistory(variantId);
        return {
            message: 'Transaction history retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List inventory stock levels across all garment variants' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InventoryQueryDto]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getInventoryList", null);
__decorate([
    Post('adjust'),
    ApiOperation({ summary: 'Perform stock count adjustment with audit transaction log' }),
    __param(0, Body()),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdjustStockDto, String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "adjustStock", null);
__decorate([
    Get(':variantId/history'),
    ApiOperation({ summary: 'Retrieve full inventory transaction history for a variant' }),
    __param(0, Param('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminInventoryController.prototype, "getTransactionHistory", null);
AdminInventoryController = __decorate([
    ApiTags('Admin - Inventory'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Controller('admin/inventory'),
    __metadata("design:paramtypes", [InventoryService])
], AdminInventoryController);
export { AdminInventoryController };
//# sourceMappingURL=admin-inventory.controller.js.map