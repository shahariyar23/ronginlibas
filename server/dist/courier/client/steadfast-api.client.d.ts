import { ConfigService } from '@nestjs/config';
export interface SteadfastCreateOrderPayload {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
}
export interface SteadfastCreateOrderResponse {
    status: number;
    message?: string;
    consignment?: {
        consignment_id: number | string;
        invoice: string;
        tracking_code: string;
        recipient_name: string;
        recipient_phone: string;
        recipient_address: string;
        cod_amount: number;
        status: string;
        note?: string;
        created_at?: string;
        updated_at?: string;
    };
    errors?: Record<string, string[]>;
}
export interface SteadfastStatusResponse {
    status: number;
    delivery_status: string;
    message?: string;
}
export interface SteadfastBalanceResponse {
    status: number;
    current_balance: number;
    message?: string;
}
export declare class SteadfastApiClient {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly secretKey;
    private readonly timeoutMs;
    constructor(configService: ConfigService);
    getBaseUrl(): string;
    isConfigured(): boolean;
    private request;
    createOrder(payload: SteadfastCreateOrderPayload): Promise<SteadfastCreateOrderResponse>;
    getStatusByCid(consignmentId: string | number): Promise<SteadfastStatusResponse>;
    getStatusByInvoice(invoice: string): Promise<SteadfastStatusResponse>;
    getStatusByTrackingCode(trackingCode: string): Promise<SteadfastStatusResponse>;
    getBalance(): Promise<SteadfastBalanceResponse>;
    createReturnRequest(consignmentId: string | number, reason?: string): Promise<{
        status: number;
        message: string;
    }>;
}
