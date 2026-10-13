import { OrderStatus } from '@prisma/client';
export declare class UpdateOrderStatusDto {
    status?: OrderStatus;
    adminNotes?: string;
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    shippingAddress?: Record<string, any>;
    overrideCourierStatus?: boolean;
}
