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
var _a, _b;
import { Body, Controller, Get, Param, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/constants/roles.constant.js';
import { CartService } from './cart.service.js';
import { AdminCartQueryDto, SendCartReminderDto } from './dto/cart-item.dto.js';
let AdminCartsController = class AdminCartsController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getCarts(query) {
        const data = await this.cartService.getAdminCarts(query);
        return {
            message: 'Admin carts stream retrieved successfully',
            data,
        };
    }
    async getCartById(id) {
        const data = await this.cartService.getAdminCartById(id);
        return {
            message: 'Cart details retrieved successfully',
            data,
        };
    }
    async sendReminder(id, dto, user) {
        const actor = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };
        const data = await this.cartService.sendCartReminder(id, dto.customMessage, actor);
        return {
            message: `Abandoned cart awareness email sent successfully to ${data.email}`,
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List customer & guest shopping carts with item breakdown' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof AdminCartQueryDto !== "undefined" && AdminCartQueryDto) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], AdminCartsController.prototype, "getCarts", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve specific cart details and items' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCartsController.prototype, "getCartById", null);
__decorate([
    Post(':id/send-reminder'),
    ApiOperation({ summary: 'Send abandoned cart recovery awareness email to patron' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof SendCartReminderDto !== "undefined" && SendCartReminderDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], AdminCartsController.prototype, "sendReminder", null);
AdminCartsController = __decorate([
    ApiTags('Admin - Abandoned Carts'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('orders'),
    Controller('admin/carts'),
    __metadata("design:paramtypes", [CartService])
], AdminCartsController);
export { AdminCartsController };
//# sourceMappingURL=admin-carts.controller.js.map