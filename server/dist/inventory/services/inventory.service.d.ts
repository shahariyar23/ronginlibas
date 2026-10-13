import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WishlistService } from '../../wishlist/wishlist.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class InventoryService {
    private readonly prisma;
    private readonly wishlistService?;
    private readonly logger;
    constructor(prisma: PrismaService, wishlistService?: WishlistService | undefined);
    getInventoryList(query: InventoryQueryDto): Promise<PaginatedResult<any>>;
    adjustStock(dto: AdjustStockDto, userId?: string): Promise<{
        variant: {
            size: string;
            color: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            measurements: Prisma.JsonValue | null;
            sku: string;
            productId: string;
            sizeLabel: string | null;
            sizeType: string | null;
            stock: number;
            priceOverride: Prisma.Decimal | null;
        };
        transaction: {
            type: import("@prisma/client").$Enums.InventoryTransactionType;
            userId: string | null;
            id: string;
            createdAt: Date;
            quantityChange: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            variantId: string;
        };
    }>;
    getTransactionHistory(variantId: string): Promise<{
        id: string;
        variantId: string;
        quantityChange: number;
        previousStock: number;
        newStock: number;
        type: import("@prisma/client").$Enums.InventoryTransactionType;
        reason: string;
        note: string;
        reference: string;
        createdAt: Date;
        user: {
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    }[]>;
}
