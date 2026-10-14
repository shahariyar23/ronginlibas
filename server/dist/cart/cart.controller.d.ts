import { CartIdentityDto, AddCartItemDto, UpdateCartItemDto, CartContactDto, RestoreCartFromOrderDto } from './dto/cart-item.dto.js';
import { CartService } from './cart.service.js';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    openCart(customerId: string | undefined, dto: CartIdentityDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    getCart(customerId: string | undefined, query: CartIdentityDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    addItem(customerId: string | undefined, dto: AddCartItemDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    updateItem(customerId: string | undefined, itemId: string, dto: UpdateCartItemDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    removeItem(customerId: string | undefined, itemId: string, query: CartIdentityDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    clearCart(customerId: string | undefined, query: CartIdentityDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
    saveContact(customerId: string | undefined, dto: CartContactDto): Promise<{
        message: string;
        data: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            guestId: string | null;
            lastReminderSentAt: Date | null;
            reminderCount: number;
        } | null;
    }>;
    restoreOrder(customerId: string | undefined, dto: RestoreCartFromOrderDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
}
export declare class CartMergeController {
    private readonly cartService;
    constructor(cartService: CartService);
    merge(customerId: string | undefined, dto: CartIdentityDto): Promise<{
        message: string;
        data: {
            cartId: string | null;
            items: never[];
            subtotal: number;
            deliveryCharge: number;
            total: number;
            currency: string;
            discountAmount?: undefined;
        } | {
            cartId: string;
            items: {
                id: string;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    image: {
                        url: string;
                        isPrimary: boolean;
                        altText: string | null;
                    };
                };
                variant: {
                    id: string;
                    size: string;
                    sizeLabel: string | null;
                    color: string;
                    availability: string;
                };
                quantity: number;
                unitPrice: number;
                lineTotal: number;
            }[];
            subtotal: number;
            discountAmount: number;
            deliveryCharge: number;
            total: number;
            currency: string;
        };
    }>;
}
