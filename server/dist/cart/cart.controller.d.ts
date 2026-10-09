import { CartIdentityDto, AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';
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
