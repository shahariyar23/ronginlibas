export declare class CreateSandboxOrderDto {
    store_id?: number;
    merchant_order_id?: string;
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
