export declare class CreatePaymentDto {
    orderNumber: string;
    provider: 'BKASH' | 'NAGAD' | 'CARD' | 'UDDOKTAPAY';
    phone?: string;
    trackingToken?: string;
}
