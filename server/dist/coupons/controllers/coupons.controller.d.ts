import { CouponsService } from '../services/coupons.service.js';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validate(body: {
        code: string;
        cartTotal: number;
    }): Promise<{
        message: string;
        data: {
            valid: boolean;
            code: string;
            type: import("@prisma/client").$Enums.CouponType;
            discountAmount: number;
        };
    }>;
}
