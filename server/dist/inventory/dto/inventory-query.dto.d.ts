import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
declare enum InventoryFilter {
    LOW_STOCK = "LOW_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    IN_STOCK = "IN_STOCK"
}
export declare class InventoryQueryDto extends PaginationQueryDto {
    filter?: InventoryFilter;
}
export {};
