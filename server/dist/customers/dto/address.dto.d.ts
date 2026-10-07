export declare class CreateAddressDto {
    fullName: string;
    email?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    division: string;
    area?: string;
    postalCode?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
}
export declare class UpdateAddressDto {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    division?: string;
    area?: string;
    postalCode?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
}
