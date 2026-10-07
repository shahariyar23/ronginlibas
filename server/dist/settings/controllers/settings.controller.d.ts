import { SettingsService } from '../services/settings.service.js';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getPublicSettings(): Promise<{
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
