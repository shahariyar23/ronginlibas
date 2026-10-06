import { SettingsService } from '../services/settings.service.js';
import { UpdateSettingsDto } from '../dto/update-settings.dto.js';
export declare class AdminSettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        message: string;
        data: Record<string, any> | {
            storeName: string;
            logo: string;
            phone: string;
            whatsapp: string;
            email: string;
            website: string;
            facebook: string;
            currency: string;
            currencySymbol: string;
            dhakaDeliveryCharge: number;
            outsideDhakaDeliveryCharge: number;
            freeDeliveryThreshold: number;
            codEnabled: boolean;
            bkashEnabled: boolean;
            bkashWallet: string;
            nagadEnabled: boolean;
            nagadWallet: string;
            storeStatus: string;
        };
    }>;
    updateSettings(dto: UpdateSettingsDto): Promise<{
        message: string;
        data: Record<string, any> | {
            storeName: string;
            logo: string;
            phone: string;
            whatsapp: string;
            email: string;
            website: string;
            facebook: string;
            currency: string;
            currencySymbol: string;
            dhakaDeliveryCharge: number;
            outsideDhakaDeliveryCharge: number;
            freeDeliveryThreshold: number;
            codEnabled: boolean;
            bkashEnabled: boolean;
            bkashWallet: string;
            nagadEnabled: boolean;
            nagadWallet: string;
            storeStatus: string;
        };
    }>;
}
