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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CustomerQueryDto, UpdateCustomerStatusDto, PermanentDeleteCustomerDto, } from '../dto/admin-customer.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminCustomersController = class AdminCustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async findAll(query) {
        const data = await this.customersService.findAll(query);
        return {
            message: 'Clientele roster retrieved successfully',
            data,
        };
    }
    async findAllArchives(query) {
        const data = await this.customersService.findAllArchives(query);
        return {
            message: 'Customer archives retrieved successfully',
            data,
        };
    }
    async findArchiveById(id) {
        const data = await this.customersService.findArchiveById(id);
        return {
            message: 'Customer archive snapshot retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.customersService.findById(id);
        return {
            message: 'Customer details retrieved successfully',
            data,
        };
    }
    async sendPasswordResetLink(id, actor) {
        return this.customersService.sendPasswordResetLink(id, actor);
    }
    async updateStatus(id, dto, actor) {
        return this.customersService.updateStatus(id, dto, actor);
    }
    async softDelete(id, actor) {
        return this.customersService.softDelete(id, actor);
    }
    async restore(id, actor) {
        return this.customersService.restore(id, actor);
    }
    async permanentDelete(id, dto, actor) {
        return this.customersService.permanentDelete(id, dto, actor);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List clientele roster with pagination, status filter, and search' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CustomerQueryDto]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findAll", null);
__decorate([
    Get('archives'),
    ApiOperation({ summary: 'List permanently deleted customer archives & purchase snapshots' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findAllArchives", null);
__decorate([
    Get('archives/:id'),
    ApiOperation({ summary: 'Retrieve specific customer archive snapshot and purchase history' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findArchiveById", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve specific customer profile and order history' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findById", null);
__decorate([
    Post(':id/reset-password'),
    ApiOperation({ summary: 'Send password reset link email to customer' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "sendPasswordResetLink", null);
__decorate([
    Patch(':id/status'),
    ApiOperation({ summary: 'Ban or activate customer with mandatory reason on ban' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCustomerStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "updateStatus", null);
__decorate([
    Delete(':id/soft'),
    ApiOperation({ summary: 'Soft delete (archive) customer' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "softDelete", null);
__decorate([
    Post(':id/restore'),
    ApiOperation({ summary: 'Restore soft-deleted customer' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "restore", null);
__decorate([
    Delete(':id/permanent'),
    ApiOperation({
        summary: 'Permanently delete customer with mandatory confirmation and purchase snapshot archive',
    }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PermanentDeleteCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "permanentDelete", null);
AdminCustomersController = __decorate([
    ApiTags('Admin - Customers'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('customers'),
    Controller('admin/customers'),
    __metadata("design:paramtypes", [CustomersService])
], AdminCustomersController);
export { AdminCustomersController };
//# sourceMappingURL=admin-customers.controller.js.map