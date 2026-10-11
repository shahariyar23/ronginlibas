import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
import { MailService } from '../mail/mail.service.js';
import { AuditService, type AdminAuditActor } from '../audit/audit.service.js';
import { AdminCartQueryDto } from './dto/cart-item.dto.js';
export declare class CartService {
    private readonly prisma;
    private readonly settingsService;
    private readonly mailService;
    private readonly auditService;
    constructor(prisma: PrismaService, settingsService: SettingsService, mailService: MailService, auditService: AuditService);
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
    saveContact(customerId: string | undefined, cartId: string | undefined, contact: {
        email?: string;
        phone?: string;
        name?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestId: string | null;
        lastReminderSentAt: Date | null;
        reminderCount: number;
    } | null>;
    getAdminCarts(query: AdminCartQueryDto): Promise<{
        carts: {
            id: string;
            guestId: string | null;
            customerId: string | null;
            isRegistered: boolean;
            customerName: string;
            email: string | null;
            phone: string | null;
            hasEmail: boolean;
            itemsCount: number;
            totalQuantity: number;
            subtotal: number;
            isAbandoned: boolean;
            lastReminderSentAt: Date | null;
            reminderCount: number;
            createdAt: Date;
            updatedAt: Date;
            items: {
                id: string;
                productId: string;
                productName: string;
                slug: string;
                image: string | null;
                variantId: string;
                size: string;
                color: string;
                stock: number;
                unitPrice: number;
                quantity: number;
                lineTotal: number;
            }[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        stats: {
            totalCartsWithItems: number;
            totalAbandonedCount: number;
            totalPotentialRevenue: number;
            totalRemindersSent: number;
        };
    }>;
    getAdminCartById(id: string): Promise<{
        id: string;
        guestId: string | null;
        customerId: string | null;
        isRegistered: boolean;
        customerName: string;
        email: string | null;
        phone: string | null;
        hasEmail: boolean;
        itemsCount: number;
        subtotal: number;
        lastReminderSentAt: Date | null;
        reminderCount: number;
        createdAt: Date;
        updatedAt: Date;
        items: {
            id: string;
            productId: string;
            productName: string;
            slug: string;
            image: string | null;
            variantId: string;
            size: string;
            color: string;
            stock: number;
            unitPrice: number;
            quantity: number;
            lineTotal: number;
        }[];
    }>;
    sendCartReminder(cartId: string, customMessage?: string, actor?: AdminAuditActor): Promise<{
        success: boolean;
        email: string;
        reminderCount: number;
        lastReminderSentAt: Date | null;
    }>;
    private findCart;
    private requireCart;
    private assertAvailable;
    private assertStock;
}
