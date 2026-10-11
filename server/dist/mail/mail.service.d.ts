import { ConfigService } from '@nestjs/config';
import { type CartReminderItem, type OrderConfirmationItem, type OrderConfirmationAddress } from './templates/index.js';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private getTransporter;
    private getFromAddress;
    private getWebUrl;
    private getAdminUrl;
    sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<boolean>;
    sendPasswordResetSuccessEmail(email: string, name?: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name?: string): Promise<boolean>;
    sendAccountBannedEmail(email: string, reason: string, name?: string): Promise<boolean>;
    sendStaffWelcomeEmail(params: {
        email: string;
        fullName: string;
        userId: string;
        role: string;
        password: string;
        mustChangePassword?: boolean;
    }): Promise<boolean>;
    sendOrderConfirmationEmail(params: {
        email: string;
        orderNumber: string;
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
        trackingToken?: string;
        invoiceBuffer?: Buffer;
    }): Promise<boolean>;
    sendOrderStatusUpdateEmail(params: {
        email: string;
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
        shippingAddress?: any;
        trackingToken?: string;
    }): Promise<boolean>;
    sendOrderEditEmail(params: {
        email: string;
        orderNumber: string;
        customerName?: string | null;
        status: string;
        totalAmount?: number | string | null;
        changeSummary?: string[] | null;
        shippingAddress?: any;
        courierName?: string | null;
        trackingNumber?: string | null;
        trackingUrl?: string | null;
        adminNotes?: string | null;
        trackingToken?: string;
    }): Promise<boolean>;
    sendAbandonedCartReminderEmail(params: {
        email: string;
        customerName?: string | null;
        items: CartReminderItem[];
        subtotal: number | string;
        totalAmount: number | string;
        cartId?: string;
        customMessage?: string | null;
    }): Promise<boolean>;
}
