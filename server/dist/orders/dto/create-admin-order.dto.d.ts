import { OrderStatus } from '@prisma/client';
export declare class CreateAdminOrderCustomerDto {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    phoneNumber?: string;
    email?: string;
}
export declare class CreateAdminOrderItemDto {
    productId?: string;
    variantId?: string;
    productVariantId?: string;
    quantity: number;
}
export declare class CreateAdminOrderAddressDto {
    addressLine1?: string;
    addressLine2?: string;
    streetAddress?: string;
    city?: string;
    district?: string;
    thana?: string;
    area?: string;
    division?: string;
    postalCode?: string;
    phone?: string;
    receiverPhone?: string;
    fullName?: string;
    receiverName?: string;
    email?: string;
    deliveryInstructions?: string;
    notes?: string;
}
export declare class CreateAdminOrderDto {
    customerId?: string;
    customer?: CreateAdminOrderCustomerDto;
    newCustomer?: CreateAdminOrderCustomerDto;
    addressId?: string;
    shippingAddress?: CreateAdminOrderAddressDto;
    items: CreateAdminOrderItemDto[];
    couponCode?: string;
    manualDiscountType?: 'FIXED' | 'PERCENTAGE';
    manualDiscountValue?: number;
    deliveryCharge?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    paymentReference?: string;
    paidAmount?: number;
    courierName?: string;
    courierProvider?: string;
    shippingMethod?: string;
    orderStatus?: OrderStatus;
    source?: string;
    customerNotes?: string;
    adminNotes?: string;
}
