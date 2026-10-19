export interface OrderConfirmationItem {
    productName: string;
    variantName?: string | null;
    sku?: string | null;
    size?: string | null;
    color?: string | null;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
    productImage?: string | null;
}
export interface OrderConfirmationAddress {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    division?: string;
    area?: string;
    postalCode?: string;
    deliveryInstructions?: string;
    [key: string]: any;
}
export interface OrderStatusBadgeConfig {
    label: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: string;
}
export declare const ORDER_STATUS_MAP: Record<string, OrderStatusBadgeConfig>;
export declare function getOrderStatusBadge(status?: string | null): OrderStatusBadgeConfig;
export interface OrderConfirmationEmailOptions {
    orderNumber: string;
    orderStatus?: string | null;
    customerName?: string | null;
    items: OrderConfirmationItem[];
    subtotal: number | string;
    deliveryCharge: number | string;
    discountAmount?: number | string;
    totalAmount: number | string;
    paymentMethod: string;
    paymentStatus: string;
    shippingAddress: OrderConfirmationAddress;
    customerNotes?: string | null;
    trackUrl: string;
    webUrl?: string;
    orderDate?: string;
    hasInvoiceAttachment?: boolean;
    invoiceNumber?: string | null;
}
export declare function renderOrderConfirmationEmail(options: OrderConfirmationEmailOptions): {
    subject: string;
    html: string;
    text: string;
};
