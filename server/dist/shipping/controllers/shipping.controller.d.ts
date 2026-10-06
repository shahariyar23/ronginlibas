import { ShippingService } from '../services/shipping.service.js';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    getZones(): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            charge: number;
            tat: string;
        }[];
    }>;
}
