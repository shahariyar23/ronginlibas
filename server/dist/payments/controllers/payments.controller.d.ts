import { PaymentsService } from '../services/payments.service.js';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getMethods(): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            isEnabled: boolean;
        }[];
    }>;
}
