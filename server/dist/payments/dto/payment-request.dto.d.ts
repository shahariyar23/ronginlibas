export declare class CreatePaymentDto {
    orderNumber: string;
    provider: 'BKASH' | 'NAGAD' | 'CARD';
    phone?: string;
    trackingToken?: string;
}
export declare class VerifyPaymentDto {
    transactionId: string;
}
