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
import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { WishlistService } from './wishlist.service.js';
let WishlistController = class WishlistController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async findAll(customerId) {
        return {
            message: 'Wishlist retrieved successfully',
            data: await this.wishlistService.findAll(customerId),
        };
    }
    async add(customerId, productId) {
        return {
            message: 'Wishlist item added successfully',
            data: await this.wishlistService.add(customerId, productId),
        };
    }
    async remove(customerId, productId) {
        return {
            message: 'Wishlist item removed successfully',
            data: await this.wishlistService.remove(customerId, productId),
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Retrieve the authenticated customer wishlist' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "findAll", null);
__decorate([
    Post('items/:productId'),
    ApiOperation({ summary: 'Save an active product to the wishlist' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "add", null);
__decorate([
    Delete('items/:productId'),
    ApiOperation({ summary: 'Remove a product from the wishlist' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "remove", null);
WishlistController = __decorate([
    ApiTags('Wishlist'),
    ApiBearerAuth(),
    UseGuards(CustomerAuthGuard),
    Controller('wishlist'),
    __metadata("design:paramtypes", [WishlistService])
], WishlistController);
export { WishlistController };
//# sourceMappingURL=wishlist.controller.js.map