import { SettingsService } from '../services/settings.service.js';
import { UpdateSettingsDto } from '../dto/update-settings.dto.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminSettingsController {
    private readonly settingsService;
    private readonly auditService;
    constructor(settingsService: SettingsService, auditService: AuditService);
    getSettings(): Promise<{
        message: string;
        data: Record<string, unknown> | {
            storeName: string;
            logo: string;
            phone: string;
            whatsapp: string;
            email: string;
            website: string;
            facebook: string;
            instagram: null;
            promotionalAnnouncement: null;
            businessHours: null;
            currency: string;
            currencySymbol: string;
            dhakaDeliveryCharge: number;
            outsideDhakaDeliveryCharge: number;
            freeShippingEnabled: boolean;
            freeDeliveryThreshold: number;
            promoEnabled: boolean;
            promoCode: string;
            promoDiscountText: string;
            whatsappOrderEnabled: boolean;
            codEnabled: boolean;
            bkashEnabled: boolean;
            nagadEnabled: boolean;
            cardEnabled: boolean;
            storeStatus: string;
        };
    }>;
    updateSettings(dto: UpdateSettingsDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: Record<string, unknown> | {
            storeName: string;
            logo: string;
            phone: string;
            whatsapp: string;
            email: string;
            website: string;
            facebook: string;
            instagram: null;
            promotionalAnnouncement: null;
            businessHours: null;
            currency: string;
            currencySymbol: string;
            dhakaDeliveryCharge: number;
            outsideDhakaDeliveryCharge: number;
            freeShippingEnabled: boolean;
            freeDeliveryThreshold: number;
            promoEnabled: boolean;
            promoCode: string;
            promoDiscountText: string;
            whatsappOrderEnabled: boolean;
            codEnabled: boolean;
            bkashEnabled: boolean;
            nagadEnabled: boolean;
            cardEnabled: boolean;
            storeStatus: string;
        };
    }>;
}
