import { PrismaService } from '../../prisma/prisma.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getInventoryList(query: PaginationQueryDto & {
        filter?: string;
    }): Promise<PaginatedResult<any>>;
    adjustStock(dto: AdjustStockDto, userId?: string): Promise<{
        variant: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: string;
            color: string;
            sku: string;
            stock: number;
            priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            productId: string;
        };
        transaction: {
            type: import("@prisma/client").$Enums.InventoryTransactionType;
            id: string;
            createdAt: Date;
            quantityChange: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            userId: string | null;
            variantId: string;
        };
        message?: undefined;
        variantId?: undefined;
        change?: undefined;
    } | {
        message: string;
        variantId: string;
        change: number;
        variant?: undefined;
        transaction?: undefined;
    }>;
    getTransactionHistory(variantId: string): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.InventoryTransactionType;
        id: string;
        createdAt: Date;
        quantityChange: number;
        previousStock: number;
        newStock: number;
        note: string | null;
        userId: string | null;
        variantId: string;
    })[]>;
}
