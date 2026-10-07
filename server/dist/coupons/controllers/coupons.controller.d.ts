import { CouponsService } from '../services/coupons.service.js';
import { ValidateCouponDto } from '../dto/validate-coupon.dto.js';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validate(dto: ValidateCouponDto): Promise<{
        message: string;
        data: {
            valid: boolean;
            code: string;
            type: import("@prisma/client").$Enums.CouponType;
            subtotal: number;
            discountAmount: number;
            totalAfterDiscount: number;
            currency: string;
        };
    }>;
}
