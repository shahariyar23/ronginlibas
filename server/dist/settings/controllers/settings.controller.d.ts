import { SettingsService } from '../services/settings.service.js';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getPublicSettings(): Promise<{
        message: string;
        data: {
            storeName: any;
            logo: any;
            phone: any;
            whatsapp: any;
            currency: any;
            currencySymbol: any;
            dhakaDeliveryCharge: any;
            outsideDhakaDeliveryCharge: any;
            freeDeliveryThreshold: any;
            codEnabled: any;
            bkashEnabled: any;
            nagadEnabled: any;
        };
    }>;
}
