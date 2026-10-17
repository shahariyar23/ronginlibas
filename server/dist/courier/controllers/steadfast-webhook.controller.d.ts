import { ShipmentService } from '../services/shipment.service.js';
import { SteadfastWebhookDto } from '../dto/steadfast-webhook.dto.js';
export declare class SteadfastWebhookController {
    private readonly shipmentService;
    private readonly logger;
    constructor(shipmentService: ShipmentService);
    handleWebhook(payload: SteadfastWebhookDto, headers: Record<string, string | string[] | undefined>): Promise<{
        success: boolean;
        message: string;
    }>;
}
