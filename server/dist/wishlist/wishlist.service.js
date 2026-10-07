var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(customerId) {
        const items = await this.prisma.wishlistItem.findMany({
            where: { customerId, product: { isActive: true } },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        shortDescription: true,
                        price: true,
                        compareAtPrice: true,
                        category: { select: { name: true, slug: true } },
                        images: {
                            select: { url: true, altText: true, isPrimary: true },
                            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                            take: 2,
                        },
                    },
                },
            },
        });
        return items.map(({ createdAt, product }) => ({
            createdAt,
            product: {
                ...product,
                price: Number(product.price),
                compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
            },
        }));
    }
    async add(customerId, productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true },
        });
        if (!product)
            throw new NotFoundException('Product not found');
        await this.prisma.wishlistItem.upsert({
            where: { customerId_productId: { customerId, productId } },
            update: {},
            create: { customerId, productId },
        });
        return { added: true };
    }
    async remove(customerId, productId) {
        const result = await this.prisma.wishlistItem.deleteMany({
            where: { customerId, productId },
        });
        if (result.count === 0)
            throw new NotFoundException('Wishlist item not found');
        return { removed: true };
    }
};
WishlistService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], WishlistService);
export { WishlistService };
//# sourceMappingURL=wishlist.service.js.map