export declare class CouponCartItemDto {
    variantId: string;
    quantity: number;
}
export declare class ValidateCouponDto {
    code: string;
    items: CouponCartItemDto[];
}
