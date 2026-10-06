import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
export declare class CouponsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        type: import("@prisma/client").$Enums.CouponType;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        expiryDate: Date;
        usageLimit: number | null;
        usageCount: number;
    }[] | {
        id: string;
        code: string;
        description: string;
        type: string;
        value: number;
        minimumOrderAmount: number;
        usageCount: number;
        expiryDate: Date;
        isActive: boolean;
    }[]>;
    create(dto: CreateCouponDto): Promise<{
        type: import("@prisma/client").$Enums.CouponType;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        expiryDate: Date;
        usageLimit: number | null;
        usageCount: number;
    } | {
        code: string;
        id: string;
    }>;
    validateCoupon(code: string, cartTotal: number): Promise<{
        valid: boolean;
        code: string;
        type: import("@prisma/client").$Enums.CouponType;
        discountAmount: number;
    }>;
    update(id: string, partial: Partial<CreateCouponDto>): Promise<{
        type: import("@prisma/client").$Enums.CouponType;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minimumOrderAmount: import("@prisma/client/runtime/library").Decimal;
        maximumDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        expiryDate: Date;
        usageLimit: number | null;
        usageCount: number;
    } | {
        updatedAt: Date;
        code?: string | undefined;
        description?: string | undefined;
        type?: "PERCENTAGE" | "FIXED" | undefined;
        value?: number | undefined;
        minimumOrderAmount?: number | undefined;
        maximumDiscount?: number | undefined;
        startDate?: string | undefined;
        expiryDate?: string | undefined;
        usageLimit?: number | undefined;
        isActive?: boolean | undefined;
        id: string;
    }>;
}
