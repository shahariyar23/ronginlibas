import { CategoriesService } from '../categories/services/categories.service.js';
import { ProductsService } from '../products/services/products.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
export declare class StorefrontService {
    private readonly productsService;
    private readonly categoriesService;
    private readonly settingsService;
    constructor(productsService: ProductsService, categoriesService: CategoriesService, settingsService: SettingsService);
    getHome(): Promise<{
        featuredProducts: any[];
        newArrivals: any[];
        bestSellers: any[];
        categories: {
            description: string | null;
            name: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            _count: {
                products: number;
            };
            slug: string;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
            children: {
                description: string | null;
                name: string;
                id: string;
                slug: string;
                sortOrder: number;
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
    }>;
}
