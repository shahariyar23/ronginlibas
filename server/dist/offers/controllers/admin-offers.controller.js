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
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from '../services/offers.service.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { QueryAdminOffersDto } from '../dto/query-offers.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let AdminOffersController = class AdminOffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    async findAll(query) {
        const data = await this.offersService.getAdminOffers(query);
        return {
            message: 'Promotional offers retrieved successfully',
            data,
        };
    }
    async findOne(id) {
        const data = await this.offersService.getAdminOfferById(id);
        return {
            message: 'Offer details retrieved successfully',
            data,
        };
    }
    async create(dto, actor) {
        const data = await this.offersService.createOffer(dto, actor);
        return {
            message: 'Offer campaign created successfully',
            data,
        };
    }
    async update(id, dto, actor) {
        const data = await this.offersService.updateOffer(id, dto, actor);
        return {
            message: 'Offer campaign updated successfully',
            data,
        };
    }
    async remove(id, actor) {
        const data = await this.offersService.deleteOffer(id, actor);
        return {
            message: data.message,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all promotional offers with status calculation' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryAdminOffersDto]),
    __metadata("design:returntype", Promise)
], AdminOffersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get offer details by ID' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOffersController.prototype, "findOne", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Create new promotional offer campaign' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOfferDto, Object]),
    __metadata("design:returntype", Promise)
], AdminOffersController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update promotional offer campaign properties' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminOffersController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Delete promotional offer campaign' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminOffersController.prototype, "remove", null);
AdminOffersController = __decorate([
    ApiTags('Admin - Offers'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('offers', 'coupons', 'products'),
    Controller('admin/offers'),
    __metadata("design:paramtypes", [OffersService])
], AdminOffersController);
export { AdminOffersController };
//# sourceMappingURL=admin-offers.controller.js.map