import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
export declare class AdminOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: OrderQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findById(id: string): Promise<{
        message: string;
        data: ({
            customer: {
                email: string | null;
                phone: string;
                firstName: string;
                lastName: string | null;
                id: string;
                passwordHash: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            items: ({
                product: {
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    sku: string;
                    slug: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    gender: import("@prisma/client").$Enums.Gender;
                    fabric: string | null;
                    fit: string | null;
                    categoryId: string;
                    isFeatured: boolean;
                    isNewArrival: boolean;
                    isBestSeller: boolean;
                };
                variant: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    size: string;
                    color: string;
                    sku: string;
                    stock: number;
                    priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                    productId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                productId: string;
                variantId: string;
                productName: string;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                orderId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            orderNumber: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            adminNotes: string | null;
        }) | {
            id: string;
            orderNumber: string;
            customer: {
                firstName: string;
                phone: string;
            };
            status: string;
            totalAmount: number;
            items: never[];
        };
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            orderNumber: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            adminNotes: string | null;
        } | {
            id: string;
            status: "PENDING" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED" | "REFUNDED";
            updatedAt: Date;
        };
    }>;
}
