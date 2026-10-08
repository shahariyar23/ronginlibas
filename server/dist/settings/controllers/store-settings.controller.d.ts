import { SettingsService } from '../services/settings.service.js';
export declare class StoreSettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        message: string;
        data: {
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
