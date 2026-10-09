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
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminCouponsController = class AdminCouponsController {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async findAll() {
        const data = await this.couponsService.findAll();
        return {
            message: 'Vouchers retrieved successfully',
            data,
        };
    }
    async create(dto) {
        const data = await this.couponsService.create(dto);
        return {
            message: 'Voucher created successfully',
            data,
        };
    }
    async update(id, body) {
        const data = await this.couponsService.update(id, body);
        return {
            message: 'Voucher updated successfully',
            data,
        };
    }
    async remove(id) {
        const data = await this.couponsService.remove(id);
        return {
            message: 'Voucher deleted successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all promotional coupons and vouchers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "findAll", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Create new promotional coupon code' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCouponDto]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update coupon properties or deactivation' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Delete a promotional coupon code' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCouponsController.prototype, "remove", null);
AdminCouponsController = __decorate([
    ApiTags('Admin - Coupons'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('coupons'),
    Controller('admin/coupons'),
    __metadata("design:paramtypes", [CouponsService])
], AdminCouponsController);
export { AdminCouponsController };
//# sourceMappingURL=admin-coupons.controller.js.map