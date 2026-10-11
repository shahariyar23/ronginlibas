export interface CartReminderItem {
    productName: string;
    variantName?: string | null;
    size?: string | null;
    color?: string | null;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
    productImage?: string | null;
    productUrl?: string | null;
}
export interface AbandonedCartReminderOptions {
    customerName?: string | null;
    items: CartReminderItem[];
    subtotal: number | string;
    totalAmount: number | string;
    cartUrl: string;
    checkoutUrl: string;
    customMessage?: string | null;
    webUrl?: string;
}
export declare function renderAbandonedCartReminderEmail(options: AbandonedCartReminderOptions): {
    subject: string;
    html: string;
    text: string;
};
