import { OffersService } from '../services/offers.service.js';
import { QueryOffersDto } from '../dto/query-offers.dto.js';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    getStorefrontOffers(query: QueryOffersDto): Promise<{
        message: string;
        data: {
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
            products: import("../services/offers.service.js").StorefrontOfferProduct[];
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
        };
    }>;
}
