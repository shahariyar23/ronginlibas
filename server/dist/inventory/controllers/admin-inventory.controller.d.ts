import { InventoryService } from '../services/inventory.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
export declare class AdminInventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventoryList(query: InventoryQueryDto): Promise<{
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
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                sku: string;
                productId: string;
                size: string;
                color: string;
                sizeLabel: string | null;
                sizeType: string | null;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            };
            transaction: {
                type: import("@prisma/client").$Enums.InventoryTransactionType;
                id: string;
                createdAt: Date;
                variantId: string;
                quantityChange: number;
                previousStock: number;
                newStock: number;
                note: string | null;
                userId: string | null;
            };
        };
    }>;
    getTransactionHistory(variantId: string): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
}
