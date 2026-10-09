import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
export declare class CartService {
    private readonly prisma;
    private readonly settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    openCart(customerId?: string, cartId?: string): Promise<{
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
    }>;
    getCart(customerId?: string, cartId?: string): Promise<{
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
    }>;
    addItem(customerId: string | undefined, cartId: string | undefined, variantId: string, quantity: number): Promise<{
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
    }>;
    updateItem(customerId: string | undefined, cartId: string | undefined, itemId: string, quantity: number): Promise<{
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
    }>;
    removeItem(customerId: string | undefined, cartId: string | undefined, itemId: string): Promise<{
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
    }>;
    clearCart(customerId: string | undefined, cartId: string | undefined): Promise<{
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
    }>;
    mergeGuestCart(customerId: string, guestId: string): Promise<{
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
    }>;
    private findCart;
    private requireCart;
    private assertAvailable;
    private assertStock;
}
