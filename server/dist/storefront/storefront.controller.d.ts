import { StorefrontService } from './storefront.service.js';
export declare class StorefrontController {
    private readonly storefrontService;
    constructor(storefrontService: StorefrontService);
    getHome(): Promise<{
        message: string;
        data: {
            featuredProducts: any[];
            newArrivals: any[];
            bestSellers: any[];
            categories: {
                description: string | null;
                id: string;
                name: string;
                _count: {
                    products: number;
                };
                sortOrder: number;
                slug: string;
                image: string | null;
                parentId: string | null;
                children: {
                    description: string | null;
                    id: string;
                    name: string;
                    sortOrder: number;
                    slug: string;
                    image: string | null;
                }[];
            }[];
            promotionalBanner: {} | null;
            storeSettings: {
                storeName: unknown;
                logo: unknown;
                phone: unknown;
                whatsapp: unknown;
                email: unknown;
                website: unknown;
                facebook: unknown;
                instagram: unknown;
                currency: unknown;
                currencySymbol: unknown;
                dhakaDeliveryCharge: unknown;
                outsideDhakaDeliveryCharge: unknown;
                freeShippingEnabled: unknown;
                freeDeliveryThreshold: unknown;
                promoEnabled: unknown;
                promoCode: unknown;
                promoDiscountText: unknown;
                whatsappOrderEnabled: unknown;
                codEnabled: unknown;
                bkashEnabled: unknown;
                nagadEnabled: unknown;
                cardEnabled: unknown;
                promotionalAnnouncement: unknown;
                businessHours: unknown;
            };
        };
    }>;
}
