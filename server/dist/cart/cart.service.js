var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
let CartService = class CartService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async openCart(customerId, cartId) {
        if (customerId) {
            const cart = await this.prisma.cart.upsert({
                where: { customerId },
                update: {},
                create: { customerId },
                select: { id: true },
            });
            return this.getCart(customerId, cart.id);
        }
        const guestId = cartId || randomUUID();
        await this.prisma.cart.upsert({
            where: { guestId },
            update: {},
            create: { guestId },
            select: { id: true },
        });
        return this.getCart(undefined, guestId);
    }
    async getCart(customerId, cartId) {
        const cart = await this.findCart(customerId, cartId);
        if (!cart)
            return { cartId: cartId ?? null, items: [], subtotal: 0, deliveryCharge: 0, total: 0, currency: 'BDT' };
        const cartWithItems = await this.prisma.cart.findUniqueOrThrow({
            where: { id: cart.id },
            select: {
                id: true,
                guestId: true,
                items: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        quantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                compareAtPrice: true,
                                isActive: true,
                                images: {
                                    select: { url: true, altText: true, isPrimary: true },
                                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                                },
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                size: true,
                                sizeLabel: true,
                                color: true,
                                priceOverride: true,
                                stock: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
        });
        const items = cartWithItems.items.map((item) => {
            const unitPrice = item.variant.priceOverride
                ? Number(item.variant.priceOverride)
                : Number(item.product.price);
            return {
                id: item.id,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    image: item.product.images[0] ?? null,
                },
                variant: {
                    id: item.variant.id,
                    size: item.variant.size,
                    sizeLabel: item.variant.sizeLabel,
                    color: item.variant.color,
                    availability: item.product.isActive && item.variant.isActive && item.variant.stock > 0
                        ? 'IN_STOCK'
                        : 'OUT_OF_STOCK',
                },
                quantity: item.quantity,
                unitPrice,
                lineTotal: unitPrice * item.quantity,
            };
        });
        const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
        const settings = await this.settingsService.getPublicSettings();
        const deliveryCharge = settings.freeShippingEnabled !== false &&
            subtotal >= Number(settings.freeDeliveryThreshold)
            ? 0
            : Number(settings.outsideDhakaDeliveryCharge);
        return {
            cartId: cartWithItems.guestId ?? cartWithItems.id,
            items,
            subtotal,
            discountAmount: 0,
            deliveryCharge,
            total: subtotal + deliveryCharge,
            currency: 'BDT',
        };
    }
    async addItem(customerId, cartId, variantId, quantity) {
        const cart = await this.requireCart(customerId, cartId);
        await this.prisma.$transaction(async (transaction) => {
            const variant = await transaction.productVariant.findUnique({
                where: { id: variantId },
                include: { product: { select: { isActive: true } } },
            });
            this.assertAvailable(variant, cart.id, quantity);
            const existing = await transaction.cartItem.findUnique({
                where: { cartId_variantId: { cartId: cart.id, variantId } },
                select: { quantity: true },
            });
            const nextQuantity = (existing?.quantity ?? 0) + quantity;
            this.assertStock(variant, nextQuantity);
            await transaction.cartItem.upsert({
                where: { cartId_variantId: { cartId: cart.id, variantId } },
                update: { quantity: nextQuantity },
                create: {
                    cartId: cart.id,
                    productId: variant.productId,
                    variantId,
                    quantity,
                },
            });
        });
        return this.getCart(customerId, cart.guestId ?? cart.id);
    }
    async updateItem(customerId, cartId, itemId, quantity) {
        const cart = await this.requireCart(customerId, cartId);
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
            select: { id: true, variantId: true },
        });
        if (!item)
            throw new NotFoundException('Cart item not found');
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { select: { isActive: true } } },
        });
        this.assertAvailable(variant, cart.id, quantity);
        this.assertStock(variant, quantity);
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity },
        });
        return this.getCart(customerId, cart.guestId ?? cart.id);
    }
    async removeItem(customerId, cartId, itemId) {
        const cart = await this.requireCart(customerId, cartId);
        const result = await this.prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id },
        });
        if (result.count === 0)
            throw new NotFoundException('Cart item not found');
        return this.getCart(customerId, cart.guestId ?? cart.id);
    }
    async clearCart(customerId, cartId) {
        const cart = await this.requireCart(customerId, cartId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.getCart(customerId, cart.guestId ?? cart.id);
    }
    async mergeGuestCart(customerId, guestId) {
        if (!guestId)
            throw new BadRequestException('A guest cart identifier is required');
        const customerCartId = await this.prisma.$transaction(async (transaction) => {
            const guestCart = await transaction.cart.findUnique({
                where: { guestId },
                include: { items: true },
            });
            if (!guestCart) {
                const cart = await transaction.cart.upsert({
                    where: { customerId },
                    update: {},
                    create: { customerId },
                    select: { id: true },
                });
                return cart.id;
            }
            const customerCart = await transaction.cart.upsert({
                where: { customerId },
                update: {},
                create: { customerId },
            });
            for (const item of guestCart.items) {
                const variant = await transaction.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: { select: { isActive: true } } },
                });
                this.assertAvailable(variant, customerCart.id, item.quantity);
                const existing = await transaction.cartItem.findUnique({
                    where: {
                        cartId_variantId: { cartId: customerCart.id, variantId: item.variantId },
                    },
                    select: { quantity: true },
                });
                const quantity = (existing?.quantity ?? 0) + item.quantity;
                this.assertStock(variant, quantity);
                await transaction.cartItem.upsert({
                    where: {
                        cartId_variantId: { cartId: customerCart.id, variantId: item.variantId },
                    },
                    update: { quantity },
                    create: {
                        cartId: customerCart.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    },
                });
            }
            await transaction.cart.delete({ where: { id: guestCart.id } });
            return customerCart.id;
        });
        return this.getCart(customerId, customerCartId);
    }
    async findCart(customerId, cartId) {
        if (customerId)
            return this.prisma.cart.findUnique({ where: { customerId } });
        if (!cartId)
            return null;
        return this.prisma.cart.findUnique({ where: { guestId: cartId } });
    }
    async requireCart(customerId, cartId) {
        const cart = await this.findCart(customerId, cartId);
        if (cart)
            return cart;
        if (customerId) {
            return this.prisma.cart.upsert({
                where: { customerId },
                update: {},
                create: { customerId },
            });
        }
        if (!cartId)
            throw new BadRequestException('A guest cart identifier is required');
        throw new NotFoundException('Cart not found');
    }
    assertAvailable(variant, _cartId, quantity) {
        if (!variant || !variant.isActive || !variant.product.isActive) {
            throw new NotFoundException('Product variant is unavailable');
        }
        this.assertStock(variant, quantity);
    }
    assertStock(variant, quantity) {
        if (!variant || variant.stock < quantity) {
            throw new BadRequestException('Requested quantity exceeds available stock');
        }
    }
};
CartService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        SettingsService])
], CartService);
export { CartService };
//# sourceMappingURL=cart.service.js.map