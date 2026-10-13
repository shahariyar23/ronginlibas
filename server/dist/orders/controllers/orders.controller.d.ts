import type { Response } from 'express';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { OrderAccessDto } from '../dto/order-access.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { OrdersService } from '../services/orders.service.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto, customerId?: string): Promise<{
        message: string;
        data: {
            guestTrackingToken?: string | undefined;
            id: string;
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
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            createdAt: Date;
            updatedAt: Date;
            items: {
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                id: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                productName: string;
                variantName: string;
                sku: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
                productId: string | null;
                variantId: string | null;
            }[];
            trackingEvents: {
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                description: string | null;
            }[];
        };
    }>;
    getMyOrders(customerId: string, query: OrderQueryDto): Promise<{
        message: string;
        data: {
            items: {
                id: string;
                orderNumber: string;
                courierName: string | null;
                trackingNumber: string | null;
                trackingUrl: string | null;
                courierProvider: string | null;
                courierStatus: string | null;
                courierLastSyncedAt: Date | null;
                estimatedDelivery: Date | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                paymentReference: string | null;
                paidAmount: import("@prisma/client/runtime/library").Decimal | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
                deliveryCharge: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue;
                customerNotes: string | null;
                createdAt: Date;
                updatedAt: Date;
                items: {
                    product: {
                        id: string;
                        name: string;
                        slug: string;
                        images: {
                            url: string;
                        }[];
                    } | null;
                    productImage: string | null;
                    id: string;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    discountAmount: import("@prisma/client/runtime/library").Decimal;
                    createdAt: Date;
                    productName: string;
                    variantName: string;
                    sku: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                    size: string | null;
                    color: string | null;
                    productId: string | null;
                    variantId: string | null;
                }[];
                trackingEvents: {
                    status: import("@prisma/client").$Enums.OrderStatus;
                    createdAt: Date;
                    description: string | null;
                }[];
            }[];
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyOrder(customerId: string, orderNumber: string): Promise<{
        message: string;
        data: {
            id: string;
            orderNumber: string;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            courierProvider: string | null;
            courierStatus: string | null;
            courierLastSyncedAt: Date | null;
            estimatedDelivery: Date | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentReference: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            items: {
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                id: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                productName: string;
                variantName: string;
                sku: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
                productId: string | null;
                variantId: string | null;
            }[];
            trackingEvents: {
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                description: string | null;
            }[];
        };
    }>;
    track(orderNumber: string, customerId: string | undefined, query: OrderAccessDto): Promise<{
        message: string;
        data: {
            orderNumber: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            courier: string;
            courierName: string | null;
            courierStatus: string;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            lastUpdatedAt: any;
            trackingEvents: {
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                description: string | null;
            }[];
        };
    }>;
    invoice(orderNumber: string, customerId: string | undefined, query: OrderAccessDto, response: Response): Promise<void>;
    getOrder(orderNumber: string, customerId: string | undefined, query: OrderAccessDto): Promise<{
        message: string;
        data: {
            id: string;
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
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            createdAt: Date;
            updatedAt: Date;
            items: {
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                id: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                productName: string;
                variantName: string;
                sku: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
                productId: string | null;
                variantId: string | null;
            }[];
            trackingEvents: {
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                description: string | null;
            }[];
        };
    }>;
    cancelOrder(orderNumber: string, customerId: string | undefined, dto: OrderAccessDto): Promise<{
        message: string;
        data: {
            id: string;
            orderNumber: string;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            courierProvider: string | null;
            courierStatus: string | null;
            courierLastSyncedAt: Date | null;
            estimatedDelivery: Date | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentReference: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            items: {
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                id: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                productName: string;
                variantName: string;
                sku: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
                productId: string | null;
                variantId: string | null;
            }[];
            trackingEvents: {
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                description: string | null;
            }[];
        };
    }>;
}
