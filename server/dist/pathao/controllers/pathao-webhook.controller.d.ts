import { PathaoService } from '../services/pathao.service.js';
export declare class PathaoWebhookController {
    private readonly pathaoService;
    private readonly logger;
    constructor(pathaoService: PathaoService);
    healthCheck(): {
        success: boolean;
        provider: string;
        service: string;
        timestamp: string;
    };
    handleWebhook(payload: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        orderId?: string;
        orderNumber?: string;
        consignmentId?: string;
        courierStatus?: import("../pathao.types.js").CourierStatus;
        courierStatusRaw?: string;
    }>;
}
