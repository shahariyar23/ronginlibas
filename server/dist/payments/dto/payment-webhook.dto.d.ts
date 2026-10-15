export declare class PaymentWebhookDto {
    full_name?: string;
    email?: string;
    amount: string | number;
    fee?: string | number;
    charged_amount?: string | number;
    invoice_id: string;
    metadata?: {
        order_id?: string;
        order_number?: string;
        payment_attempt_id?: string;
        [key: string]: any;
    };
    payment_method?: string;
    sender_number?: string;
    transaction_id?: string;
    date?: string;
    status: string;
}
export declare class UddoktaWebhookPayloadDto extends PaymentWebhookDto {
}
