export declare class CreateCouponDto {
    code: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minimumOrderAmount?: number;
    maximumDiscount?: number;
    startDate?: string;
    expiryDate: string;
    usageLimit?: number;
    isActive?: boolean;
}
