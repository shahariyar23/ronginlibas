import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { QueryOffersDto, QueryAdminOffersDto } from '../dto/query-offers.dto.js';
export interface StorefrontOfferProduct {
    id: string;
    slug: string;
    name: string;
    sku: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    price: number;
    originalPrice?: number;
    discountPercentage: number;
    badge?: string;
    images: string[];
    imageDetails: Array<{
        url: string;
        altText?: string;
    }>;
    colors: Array<{
        name: string;
        hex: string;
    }>;
    sizes: string[];
    inStock: boolean;
    stockCount: number;
    averageRating: number;
    reviewsCount: number;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    fabric?: string;
    fabricOrigin?: string;
}
export declare class OffersService {
    private readonly prisma;
    private readonly settingsService;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, settingsService: SettingsService, auditService: AuditService);
    getStorefrontOffers(query: QueryOffersDto): Promise<{
        hero: {
            title: string;
            subtitle: string;
            bannerMessage: string;
            maxDiscountPercent: number;
            hasActivePromotion: boolean;
        };
        countdown: {
            offerName: string;
            startDate: string;
            expiryDate: string;
            isActive: boolean;
        } | null;
        freeDelivery: {
            enabled: boolean;
            threshold: number;
            message: string;
        };
        coupons: {
            id: string;
            code: string;
            description: string | null;
            type: import("@prisma/client").$Enums.CouponType;
            value: number;
            minimumOrderAmount: number;
            maximumDiscount: number | null;
            expiryDate: string;
        }[];
        offers: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            offerType: import("@prisma/client").$Enums.OfferType;
            discountType: import("@prisma/client").$Enums.OfferDiscountType;
            discountValue: number;
            startDate: string;
            expiryDate: string;
            badgeText: string | null;
            couponCode: string | null;
            productCount: number;
        }[];
        products: StorefrontOfferProduct[];
        facets: {
            categories: {
                id: string;
                name: string;
                slug: string;
                count: number;
            }[];
            discountBands: {
                label: string;
                min: number;
                count: number;
            }[];
            colors: string[];
            sizes: string[];
            priceRange: {
                min: number;
                max: number;
            };
        };
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminOffers(query: QueryAdminOffersDto): Promise<{
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
    }[]>;
    getAdminOfferById(id: string): Promise<{
        discountValue: number;
        startDate: string;
        expiryDate: string;
        status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";
        products: {
            name: string;
            price: Prisma.Decimal;
            id: string;
            slug: string;
            sku: string;
        }[];
        categories: {
            name: string;
            id: string;
            slug: string;
        }[];
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        couponCode: string | null;
        bannerTitle: string | null;
        bannerSubtitle: string | null;
        bannerMessage: string | null;
        offerType: import("@prisma/client").$Enums.OfferType;
        discountType: import("@prisma/client").$Enums.OfferDiscountType;
        badgeText: string | null;
        priority: number;
    }>;
    createOffer(dto: CreateOfferDto, actor: AdminAuditActor): Promise<{
        products: {
            name: string;
            id: string;
        }[];
        collections: {
            name: string;
            id: string;
        }[];
        categories: {
            name: string;
            id: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        couponCode: string | null;
        startDate: Date;
        expiryDate: Date;
        bannerTitle: string | null;
        bannerSubtitle: string | null;
        bannerMessage: string | null;
        offerType: import("@prisma/client").$Enums.OfferType;
        discountType: import("@prisma/client").$Enums.OfferDiscountType;
        discountValue: Prisma.Decimal;
        badgeText: string | null;
        priority: number;
    }>;
    updateOffer(id: string, dto: Partial<CreateOfferDto>, actor: AdminAuditActor): Promise<{
        products: {
            name: string;
            id: string;
        }[];
        collections: {
            name: string;
            id: string;
        }[];
        categories: {
            name: string;
            id: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        couponCode: string | null;
        startDate: Date;
        expiryDate: Date;
        bannerTitle: string | null;
        bannerSubtitle: string | null;
        bannerMessage: string | null;
        offerType: import("@prisma/client").$Enums.OfferType;
        discountType: import("@prisma/client").$Enums.OfferDiscountType;
        discountValue: Prisma.Decimal;
        badgeText: string | null;
        priority: number;
    }>;
    deleteOffer(id: string, actor: AdminAuditActor): Promise<{
        message: string;
    }>;
}
