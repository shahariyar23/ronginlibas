export declare class CreatePaymentDto {
    orderNumber: string;
    provider: 'BKASH' | 'NAGAD' | 'CARD' | 'UDDOKTAPAY' | 'WAITMARK_PAY';
    phone?: string;
    trackingToken?: string;
}
