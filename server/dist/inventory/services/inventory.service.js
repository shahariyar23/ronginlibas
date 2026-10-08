var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInventoryList(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { sku: { contains: query.search, mode: 'insensitive' } },
                { product: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        if (query.filter === 'LOW_STOCK') {
            where.stock = { gt: 0, lte: 5 };
        }
        else if (query.filter === 'OUT_OF_STOCK') {
            where.stock = { equals: 0 };
        }
        else if (query.filter === 'IN_STOCK') {
            where.stock = { gt: 5 };
        }
        const [items, total] = await Promise.all([
            this.prisma.productVariant.findMany({
                where,
                skip,
                take: limit,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            fabric: true,
                            alertThreshold: true,
                            category: { select: { name: true } },
                            images: { where: { isPrimary: true }, take: 1 },
                        },
                    },
                },
                orderBy: { stock: 'asc' },
            }),
            this.prisma.productVariant.count({ where }),
        ]);
        return {
            items: items.map((v) => ({
                id: v.id,
                variantId: v.id,
                productId: v.productId,
                productName: v.product.name,
                subtitle: v.product.fabric || 'Atelier Standard',
                category: v.product.category?.name || 'General',
                size: v.size,
                color: v.color,
                sku: v.sku,
                stock: v.stock,
                alertThreshold: v.product.alertThreshold ?? 5,
                status: v.stock === 0
                    ? 'OUT OF STOCK'
                    : v.stock <= (v.product.alertThreshold ?? 5)
                        ? 'LOW STOCK'
                        : 'IN STOCK',
                image: v.product.images[0]?.url || '',
            })),
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async adjustStock(dto, userId) {
        return this.prisma.$transaction(async (transaction) => {
            const variant = await transaction.productVariant.findUnique({
                where: { id: dto.variantId },
            });
            if (!variant) {
                throw new NotFoundException(`Product variant not found: ${dto.variantId}`);
            }
            const previousStock = variant.stock;
            const newStock = previousStock + dto.quantityChange;
            if (newStock < 0) {
                throw new BadRequestException(`Insufficient stock. Current: ${previousStock}, Requested change: ${dto.quantityChange}`);
            }
            const update = await transaction.productVariant.updateMany({
                where: { id: dto.variantId, stock: previousStock },
                data: { stock: newStock },
            });
            if (!update.count) {
                throw new ConflictException('Stock changed while adjusting; retry the adjustment');
            }
            const updatedVariant = await transaction.productVariant.findUniqueOrThrow({
                where: { id: dto.variantId },
            });
            const history = await transaction.inventoryTransaction.create({
                data: {
                    variantId: dto.variantId,
                    quantityChange: dto.quantityChange,
                    previousStock,
                    newStock,
                    type: dto.type,
                    note: dto.note,
                    userId,
                },
            });
            return {
                variant: updatedVariant,
                transaction: history,
            };
        });
    }
    async getTransactionHistory(variantId) {
        return this.prisma.inventoryTransaction.findMany({
            where: { variantId },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
InventoryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], InventoryService);
export { InventoryService };
//# sourceMappingURL=inventory.service.js.map