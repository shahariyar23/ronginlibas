import { UddoktaPaymentService } from './uddokta-payment.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
export declare class PaymentReconciliationService {
    private readonly uddoktaPaymentService;
    private readonly ordersService;
    private readonly logger;
    private isRunning;
    constructor(uddoktaPaymentService: UddoktaPaymentService, ordersService: OrdersService);
    handlePaymentReconciliation(): Promise<void>;
}
