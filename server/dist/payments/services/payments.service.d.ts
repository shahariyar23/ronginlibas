export interface PaymentGatewayProvider {
    initiatePayment(orderId: string, amount: number): Promise<any>;
    verifyPayment(transactionId: string): Promise<any>;
}
export declare class PaymentsService {
    getAvailableMethods(): Promise<{
        id: string;
        name: string;
        isEnabled: boolean;
    }[]>;
}
