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
            sortOrder: number;
            name: string;
            slug: string;
            id: string;
            image: string | null;
            parentId: string | null;
            children: {
                description: string | null;
                sortOrder: number;
                name: string;
                slug: string;
                id: string;
                image: string | null;
            }[];
            _count: {
                products: number;
            };
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
            freeDeliveryThreshold: unknown;
            codEnabled: unknown;
            bkashEnabled: unknown;
            nagadEnabled: unknown;
            cardEnabled: unknown;
            promotionalAnnouncement: unknown;
            businessHours: unknown;
        };
    }>;
}
