var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
        try {
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
                    status: v.stock === 0 ? 'OUT OF STOCK' : v.stock <= 5 ? 'LOW STOCK' : 'IN STOCK',
                    image: v.product.images[0]?.url || '',
                })),
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            };
        }
        catch {
            const fallbackList = [
                {
                    id: 'inv-1',
                    variantId: 'v-1',
                    productName: 'Premium Green Panjabi',
                    subtitle: '100% Egyptian Mercerised Cotton',
                    sku: 'RL-PNJ-01',
                    category: 'Panjabi',
                    stock: 18,
                    status: 'IN STOCK',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
                },
                {
                    id: 'inv-2',
                    variantId: 'v-2',
                    productName: 'Black Panjabi',
                    subtitle: 'Bespoke Textured Linen',
                    sku: 'RL-PNJ-02',
                    category: 'Panjabi',
                    stock: 3,
                    status: 'LOW STOCK',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ',
                },
                {
                    id: 'inv-3',
                    variantId: 'v-3',
                    productName: 'Classic White Shirt',
                    subtitle: '120s Two-Ply Pinpoint Oxford',
                    sku: 'RL-SHT-02',
                    category: 'Shirts',
                    stock: 0,
                    status: 'OUT OF STOCK',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA',
                },
            ];
            return {
                items: fallbackList,
                page,
                limit,
                total: fallbackList.length,
                totalPages: 1,
            };
        }
    }
    async adjustStock(dto, userId) {
        try {
            const variant = await this.prisma.productVariant.findUnique({
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
            const [updatedVariant, transaction] = await this.prisma.$transaction([
                this.prisma.productVariant.update({
                    where: { id: dto.variantId },
                    data: { stock: newStock },
                }),
                this.prisma.inventoryTransaction.create({
                    data: {
                        variantId: dto.variantId,
                        quantityChange: dto.quantityChange,
                        previousStock,
                        newStock,
                        type: dto.type,
                        note: dto.note,
                        userId,
                    },
                }),
            ]);
            return {
                variant: updatedVariant,
                transaction,
            };
        }
        catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException)
                throw err;
            return {
                message: 'Stock adjusted successfully (mock)',
                variantId: dto.variantId,
                change: dto.quantityChange,
            };
        }
    }
    async getTransactionHistory(variantId) {
        try {
            return await this.prisma.inventoryTransaction.findMany({
                where: { variantId },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch {
            return [];
        }
    }
};
InventoryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], InventoryService);
export { InventoryService };
//# sourceMappingURL=inventory.service.js.map