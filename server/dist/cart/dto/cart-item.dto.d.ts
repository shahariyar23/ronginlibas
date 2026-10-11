export declare class AddCartItemDto {
    variantId: string;
    quantity: number;
    cartId?: string;
}
export declare class UpdateCartItemDto {
    quantity: number;
    cartId?: string;
}
export declare class CartIdentityDto {
    cartId?: string;
}
export declare class CartContactDto {
    cartId?: string;
    email?: string;
    phone?: string;
    name?: string;
}
export declare class AdminCartQueryDto {
    page?: string;
    limit?: string;
    filter?: string;
    search?: string;
}
export declare class SendCartReminderDto {
    customMessage?: string;
}
