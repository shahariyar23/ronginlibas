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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../auth/guards/optional-customer-auth.guard.js';
import { CartIdentityDto, AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';
import { CartService } from './cart.service.js';
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    async openCart(customerId, dto) {
        return { message: 'Cart ready', data: await this.cartService.openCart(customerId, dto.cartId) };
    }
    async getCart(customerId, query) {
        return { message: 'Cart retrieved successfully', data: await this.cartService.getCart(customerId, query.cartId) };
    }
    async addItem(customerId, dto) {
        return {
            message: 'Cart item added successfully',
            data: await this.cartService.addItem(customerId, dto.cartId, dto.variantId, dto.quantity),
        };
    }
    async updateItem(customerId, itemId, dto) {
        return {
            message: 'Cart item updated successfully',
            data: await this.cartService.updateItem(customerId, dto.cartId, itemId, dto.quantity),
        };
    }
    async removeItem(customerId, itemId, query) {
        return {
            message: 'Cart item removed successfully',
            data: await this.cartService.removeItem(customerId, query.cartId, itemId),
        };
    }
    async clearCart(customerId, query) {
        return {
            message: 'Cart emptied successfully',
            data: await this.cartService.clearCart(customerId, query.cartId),
        };
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Create or retrieve a guest or customer cart' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CartIdentityDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "openCart", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Retrieve cart items and server-calculated totals' }),
    __param(0, CurrentUser('id')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CartIdentityDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    Post('items'),
    ApiOperation({ summary: 'Add a current database-priced variant to the cart' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addItem", null);
__decorate([
    Patch('items/:itemId'),
    ApiOperation({ summary: 'Update a cart item quantity' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('itemId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateItem", null);
__decorate([
    Delete('items/:itemId'),
    ApiOperation({ summary: 'Remove an item from the owned cart' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('itemId')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CartIdentityDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItem", null);
__decorate([
    Delete(),
    ApiOperation({ summary: 'Remove all items from the owned cart' }),
    __param(0, CurrentUser('id')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CartIdentityDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
CartController = __decorate([
    ApiTags('Cart'),
    UseGuards(OptionalCustomerAuthGuard),
    Controller('cart'),
    __metadata("design:paramtypes", [CartService])
], CartController);
export { CartController };
let CartMergeController = class CartMergeController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    async merge(customerId, dto) {
        if (!customerId) {
            throw new UnauthorizedException('Customer authentication is required to merge a cart');
        }
        return {
            message: 'Cart merged successfully',
            data: await this.cartService.mergeGuestCart(customerId, dto.cartId ?? ''),
        };
    }
};
__decorate([
    Post('merge'),
    ApiOperation({ summary: 'Merge a guest cart into the signed-in customer cart' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CartIdentityDto]),
    __metadata("design:returntype", Promise)
], CartMergeController.prototype, "merge", null);
CartMergeController = __decorate([
    ApiTags('Cart'),
    ApiBearerAuth(),
    UseGuards(OptionalCustomerAuthGuard),
    Controller('cart'),
    __metadata("design:paramtypes", [CartService])
], CartMergeController);
export { CartMergeController };
//# sourceMappingURL=cart.controller.js.map