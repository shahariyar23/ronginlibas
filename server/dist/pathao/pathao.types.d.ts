export type PathaoEnvironment = 'sandbox' | 'production';
export interface PathaoTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}
export interface PathaoCity {
    city_id: number;
    city_name: string;
}
export interface PathaoZone {
    zone_id: number;
    zone_name: string;
}
export interface PathaoArea {
    area_id: number;
    area_name: string;
    home_delivery_available?: boolean;
    pickup_available?: boolean;
}
export interface PathaoStore {
    store_id: number;
    store_name: string;
    store_address: string;
    is_active?: boolean;
    city_id?: number;
    zone_id?: number;
    hub_id?: number;
}
export interface PathaoPricePlanRequest {
    store_id?: number;
    item_type: number;
    delivery_type: number;
    item_weight: number;
    recipient_city: number;
    recipient_zone: number;
}
export interface PathaoPricePlanResponse {
    price: number;
    plan_id?: number;
    additional_charge?: number;
    discount?: number;
}
export interface PathaoCreateOrderRequest {
    store_id: number;
    merchant_order_id: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    recipient_city?: number;
    recipient_zone?: number;
    recipient_area?: number;
    delivery_type: number;
    item_type: number;
    special_instruction?: string;
    item_quantity: number;
    item_weight: number | string;
    amount_to_collect: number;
    item_description: string;
}
export interface PathaoCreateOrderResponse {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee?: number;
    created_at?: string;
}
export interface PathaoOrderInfoResponse {
    consignment_id: string;
    merchant_order_id?: string;
    order_status: string;
    order_status_slug?: string;
    recipient_name?: string;
    recipient_phone?: string;
    recipient_address?: string;
    amount_to_collect?: number;
    collected_amount?: number;
    delivery_fee?: number;
    updated_at?: string;
    history?: Array<{
        status: string;
        message?: string;
        time?: string;
    }>;
}
export interface PathaoConnectionTestResult {
    success: boolean;
    environment: 'sandbox';
    provider: 'Pathao';
    message: string;
    details?: {
        baseUrl: string;
        storesCount?: number;
        citiesCount?: number;
        simulationMode?: boolean;
        authenticatedAt?: string;
    };
}
export interface PathaoStatusResponse {
    environment: 'sandbox';
    provider: 'Pathao';
    configured: boolean;
    connected: boolean;
    baseUrl: string;
    message?: string;
    defaultStoreId?: number | null;
    stores?: PathaoStore[];
}
