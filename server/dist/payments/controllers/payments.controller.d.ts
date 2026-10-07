import { PaymentsService } from '../services/payments.service.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getMethods(): Promise<{
        message: string;
        data: ({
            id: string;
            name: string;
            isEnabled: boolean;
            credentialsConfigured?: undefined;
        } | {
            id: string;
            name: string;
            isEnabled: boolean;
            credentialsConfigured: boolean;
        })[];
    }>;
    create(dto: CreatePaymentDto, customerId?: string): Promise<{
        message: string;
        data: void;
    }>;
    verify(_dto: VerifyPaymentDto): Promise<{
        message: string;
        data: void;
    }>;
    webhook(_provider: string, _body: unknown): Promise<{
        message: string;
        data: void;
    }>;
}
