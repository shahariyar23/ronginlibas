import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../../orders/services/orders.service.js';
import { WaitmarkPaymentService } from './waitmark-payment.service.js';
export interface PaymentGatewayProvider {
    initiatePayment(orderNumber: string, amount: number): Promise<{
        redirectUrl: string;
    }>;
    verifyPayment(transactionId: string): Promise<{
        verified: boolean;
    }>;
}
export declare class PaymentsService {
    private readonly configService;
    private readonly ordersService;
    private readonly waitmarkService;
    constructor(configService: ConfigService, ordersService: OrdersService, waitmarkService: WaitmarkPaymentService);
    getAvailableMethods(): Promise<({
        id: string;
        name: string;
        isEnabled: boolean;
        credentialsConfigured?: undefined;
    } | {
        id: string;
        name: string;
        isEnabled: boolean;
        credentialsConfigured: boolean;
    })[]>;
    createPayment(orderNumber: string, provider: 'BKASH' | 'NAGAD' | 'CARD', customerId?: string, phone?: string, trackingToken?: string): Promise<void>;
    verifyPayment(): Promise<void>;
    handleWebhook(): Promise<void>;
}
