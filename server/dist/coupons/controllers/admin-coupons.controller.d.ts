import { CouponsService } from '../services/coupons.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
export declare class AdminCouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    findAll(): Promise<{
        message: string;
        data: {
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            value: import("@prisma/client/runtime/library").Decimal;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
            maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
            startDate: Date;
            expiryDate: Date;
            usageLimit: number | null;
            usageCount: number;
        }[];
    }>;
    create(dto: CreateCouponDto): Promise<{
        message: string;
        data: {
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            value: import("@prisma/client/runtime/library").Decimal;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
            maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
            startDate: Date;
            expiryDate: Date;
            usageLimit: number | null;
            usageCount: number;
        };
    }>;
    update(id: string, body: Partial<CreateCouponDto>): Promise<{
        message: string;
        data: {
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            value: import("@prisma/client/runtime/library").Decimal;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
            maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
            startDate: Date;
            expiryDate: Date;
            usageLimit: number | null;
            usageCount: number;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
        data: {
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            value: import("@prisma/client/runtime/library").Decimal;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
            maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
            startDate: Date;
            expiryDate: Date;
            usageLimit: number | null;
            usageCount: number;
        };
    }>;
}
