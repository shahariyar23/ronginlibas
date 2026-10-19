export interface InvoiceTemplateItem {
    productName: string;
    size?: string | null;
    color?: string | null;
    sku?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    thumbnailBase64?: string | null;
    imageUrl?: string | null;
}
export interface InvoiceTemplateData {
    invoiceNumber: string;
    orderNumber: string;
    issueDate: string;
    orderStatus: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string | null;
    deliveryMethod: string;
    deliveryStatus?: string | null;
    items: InvoiceTemplateItem[];
    itemsSubtotal: number;
    discountAmount?: number;
    deliveryCharge?: number;
    grandTotal: number;
    logoBase64?: string;
}
export declare function renderInvoiceHtml(data: InvoiceTemplateData): string;
