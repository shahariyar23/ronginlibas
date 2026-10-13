export declare class CreateOrderItemDto {
    productId: string;
    variantId: string;
    quantity: number;
}
export declare class ShippingAddressDto {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    division: string;
    phone: string;
    fullName?: string;
    email?: string;
    area?: string;
    postalCode?: string;
    deliveryInstructions?: string;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    shippingAddress: ShippingAddressDto;
    paymentMethod?: 'COD' | 'BKASH' | 'NAGAD' | 'CARD' | 'WAITMARK_PAY';
    couponCode?: string;
    customerNotes?: string;
    guestName?: string;
    guestEmail?: string;
    customTailoringNote?: string;
}
