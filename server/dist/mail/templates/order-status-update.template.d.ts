export interface OrderStatusUpdateEmailOptions {
    orderNumber: string;
    customerName?: string | null;
    newStatus: string;
    previousStatus?: string | null;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    estimatedDelivery?: Date | string | null;
    adminNotes?: string | null;
    totalAmount?: number | string | null;
    shippingAddress?: {
        fullName?: string;
        phone?: string;
        addressLine1?: string;
        city?: string;
        division?: string;
        [key: string]: any;
    } | null;
    trackUrl: string;
    webUrl?: string;
}
export declare function renderOrderStatusUpdateEmail(options: OrderStatusUpdateEmailOptions): {
    subject: string;
    html: string;
    text: string;
};
