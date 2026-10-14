export interface AdminOrderCancellationAlertOptions {
    orderNumber: string;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    createdAt: Date | string;
    cancelledAt: Date | string;
    orderAgeText: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number | string;
    items: Array<{
        productName: string;
        variantName?: string | null;
        size?: string | null;
        color?: string | null;
        quantity: number;
        unitPrice: number | string;
        subtotal: number | string;
    }>;
    adminNotes?: string | null;
    adminOrderUrl: string;
    webUrl?: string;
}
export declare function renderAdminOrderCancellationAlertEmail(options: AdminOrderCancellationAlertOptions): {
    subject: string;
    html: string;
    text: string;
};
