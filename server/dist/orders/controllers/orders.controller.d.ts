import { OrdersService } from '../services/orders.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto, customerId: string): Promise<{
        message: string;
        data: ({
            items: {
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
            }[];
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
            subtotal: number;
            deliveryCharge: number;
            totalAmount: number;
            status: string;
        };
    }>;
    getMyOrders(customerId: string): Promise<{
        message: string;
        data: ({
            items: {
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
            }[];
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
        })[];
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
}
