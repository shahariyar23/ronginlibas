import { InventoryService } from '../services/inventory.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminInventoryController {
    private readonly inventoryService;
    private readonly auditService;
    constructor(inventoryService: InventoryService, auditService: AuditService);
    getInventoryList(query: InventoryQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    adjustStock(dto: AdjustStockDto, userId: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            variant: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                size: string;
                color: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                sizeLabel: string | null;
                sizeType: string | null;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
            };
            transaction: {
                id: string;
                createdAt: Date;
                quantityChange: number;
                previousStock: number;
                newStock: number;
                type: import("@prisma/client").$Enums.InventoryTransactionType;
                note: string | null;
                variantId: string;
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
