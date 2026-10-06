export declare class AdjustStockDto {
    variantId: string;
    quantityChange: number;
    type?: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'RESTOCK';
    note?: string;
}
