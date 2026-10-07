import { SettingsService } from '../../settings/services/settings.service.js';
export interface CourierProvider {
    createShipment(orderNumber: string, details: Record<string, unknown>): Promise<unknown>;
    trackShipment(consignmentId: string): Promise<unknown>;
}
export declare class ShippingService {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getDeliveryZones(): Promise<{
        id: string;
        name: string;
        charge: unknown;
        freeDeliveryThreshold: unknown;
    }[]>;
}
