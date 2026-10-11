import { CartService } from './cart.service.js';
import { AdminCartQueryDto, SendCartReminderDto } from './dto/cart-item.dto.js';
export declare class AdminCartsController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCarts(query: AdminCartQueryDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getCartById(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    sendReminder(id: string, dto: SendCartReminderDto, user: any): Promise<{
        message: string;
        data: {
            success: boolean;
            email: string;
            reminderCount: number;
            lastReminderSentAt: Date | null;
        };
    }>;
}
