import { InventoryService } from '../services/inventory.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class AdminInventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventoryList(query: PaginationQueryDto & {
        filter?: string;
    }): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    adjustStock(dto: AdjustStockDto, userId?: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getTransactionHistory(variantId: string): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
}
