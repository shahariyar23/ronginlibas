import { CouponsService } from '../services/coupons.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminCouponsController {
    private readonly couponsService;
    private readonly auditService;
    constructor(couponsService: CouponsService, auditService: AuditService);
    findAll(): Promise<{
        message: string;
        data: {
            value: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            createdAt: Date;
            id: string;
            isActive: boolean;
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
    create(dto: CreateCouponDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            value: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            createdAt: Date;
            id: string;
            isActive: boolean;
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
    update(id: string, body: Partial<CreateCouponDto>, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            value: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            createdAt: Date;
            id: string;
            isActive: boolean;
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
    remove(id: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            value: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.CouponType;
            description: string | null;
            createdAt: Date;
            id: string;
            isActive: boolean;
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
