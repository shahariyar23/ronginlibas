import { OffersService } from '../services/offers.service.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { QueryAdminOffersDto } from '../dto/query-offers.dto.js';
import { type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminOffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    findAll(query: QueryAdminOffersDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            bannerTitle: string | null;
            bannerSubtitle: string | null;
            bannerMessage: string | null;
            offerType: import("@prisma/client").$Enums.OfferType;
            discountType: import("@prisma/client").$Enums.OfferDiscountType;
            discountValue: number;
            startDate: string;
            expiryDate: string;
            isActive: boolean;
            status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";
            badgeText: string | null;
            couponCode: string | null;
            priority: number;
            productCount: number;
            categoryCount: number;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            discountValue: number;
            startDate: string;
            expiryDate: string;
            status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";
            products: {
                id: string;
                name: string;
                slug: string;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
            }[];
            categories: {
                id: string;
                name: string;
                slug: string;
            }[];
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            bannerTitle: string | null;
            bannerSubtitle: string | null;
            bannerMessage: string | null;
            offerType: import("@prisma/client").$Enums.OfferType;
            discountType: import("@prisma/client").$Enums.OfferDiscountType;
            badgeText: string | null;
            couponCode: string | null;
            priority: number;
        };
    }>;
    create(dto: CreateOfferDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            products: {
                id: string;
                name: string;
            }[];
            collections: {
                id: string;
                name: string;
            }[];
            categories: {
                id: string;
                name: string;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            startDate: Date;
            expiryDate: Date;
            bannerTitle: string | null;
            bannerSubtitle: string | null;
            bannerMessage: string | null;
            offerType: import("@prisma/client").$Enums.OfferType;
            discountType: import("@prisma/client").$Enums.OfferDiscountType;
            discountValue: import("@prisma/client/runtime/library").Decimal;
            badgeText: string | null;
            couponCode: string | null;
            priority: number;
        };
    }>;
    update(id: string, dto: Partial<CreateOfferDto>, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            products: {
                id: string;
                name: string;
            }[];
            collections: {
                id: string;
                name: string;
            }[];
            categories: {
                id: string;
                name: string;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            startDate: Date;
            expiryDate: Date;
            bannerTitle: string | null;
            bannerSubtitle: string | null;
            bannerMessage: string | null;
            offerType: import("@prisma/client").$Enums.OfferType;
            discountType: import("@prisma/client").$Enums.OfferDiscountType;
            discountValue: import("@prisma/client/runtime/library").Decimal;
            badgeText: string | null;
            couponCode: string | null;
            priority: number;
        };
    }>;
    remove(id: string, actor: AdminAuditActor): Promise<{
        message: string;
    }>;
}
