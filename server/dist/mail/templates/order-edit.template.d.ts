export interface OrderEditEmailOptions {
    orderNumber: string;
    customerName?: string | null;
    status: string;
    totalAmount?: number | string | null;
    changeSummary?: string[] | null;
    shippingAddress?: {
        fullName?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        division?: string;
        area?: string;
        postalCode?: string;
        [key: string]: any;
    } | null;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    adminNotes?: string | null;
    trackUrl: string;
    webUrl?: string;
}
export declare function renderOrderEditEmail(options: OrderEditEmailOptions): {
    subject: string;
    html: string;
    text: string;
};
