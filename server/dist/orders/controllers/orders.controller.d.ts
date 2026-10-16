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
                    name: string;
                    id: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                productName: string;
                size: string | null;
                color: string | null;
                createdAt: Date;
                id: string;
                variantId: string | null;
                sku: string;
                productId: string | null;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
            }[];
            trackingEvents: {
                description: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
            }[];
        };
    }>;
    getMyOrders(customerId: string, query: OrderQueryDto): Promise<{
        message: string;
        data: {
            items: {
                invoice: {
                    totalAmount: import("@prisma/client/runtime/library").Decimal;
                    invoiceNumber: string;
                    status: import("@prisma/client").$Enums.InvoiceStatus;
                    id: string;
                    issuedAt: Date;
                } | null;
                items: {
                    product: {
                        name: string;
                        id: string;
                        slug: string;
                        images: {
                            url: string;
                        }[];
                    } | null;
                    productImage: string | null;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    discountAmount: import("@prisma/client/runtime/library").Decimal;
                    productName: string;
                    size: string | null;
                    color: string | null;
                    createdAt: Date;
                    id: string;
                    variantId: string | null;
                    sku: string;
                    productId: string | null;
                    variantName: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                }[];
                orderNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                deliveryCharge: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue;
                customerNotes: string | null;
                courierName: string | null;
                trackingNumber: string | null;
                trackingUrl: string | null;
                estimatedDelivery: Date | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                courierProvider: string | null;
                courierStatus: string | null;
                courierLastSyncedAt: Date | null;
                paymentReference: string | null;
                paidAmount: import("@prisma/client/runtime/library").Decimal | null;
                manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
                trackingEvents: {
                    description: string | null;
                    status: import("@prisma/client").$Enums.OrderStatus;
                    createdAt: Date;
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
            invoice: {
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                id: string;
                issuedAt: Date;
            } | null;
            items: {
                product: {
                    name: string;
                    id: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                productName: string;
                size: string | null;
                color: string | null;
                createdAt: Date;
                id: string;
                variantId: string | null;
                sku: string;
                productId: string | null;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
            }[];
            orderNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            courierProvider: string | null;
            courierStatus: string | null;
            courierLastSyncedAt: Date | null;
            paymentReference: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
            trackingEvents: {
                description: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
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
                description: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
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
                    name: string;
                    id: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                productName: string;
                size: string | null;
                color: string | null;
                createdAt: Date;
                id: string;
                variantId: string | null;
                sku: string;
                productId: string | null;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
            }[];
            trackingEvents: {
                description: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
            }[];
        };
    }>;
    cancelOrder(orderNumber: string, customerId: string | undefined, dto: OrderAccessDto): Promise<{
        message: string;
        data: {
            customer: {
                email: string | null;
                phone: string | null;
                firstName: string;
                lastName: string | null;
            } | null;
            invoice: {
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                id: string;
                issuedAt: Date;
            } | null;
            items: {
                product: {
                    name: string;
                    id: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                productName: string;
                size: string | null;
                color: string | null;
                createdAt: Date;
                id: string;
                variantId: string | null;
                sku: string;
                productId: string | null;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
            }[];
            orderNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            adminNotes: string | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            trackingTokenHash: string | null;
            courierProvider: string | null;
            courierStatus: string | null;
            courierLastSyncedAt: Date | null;
            paymentReference: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
            trackingEvents: {
                description: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
            }[];
        } | ({
            customer: {
                email: string | null;
                phone: string | null;
                firstName: string;
                lastName: string | null;
                id: string;
            } | null;
            items: {
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                productName: string;
                size: string | null;
                color: string | null;
                createdAt: Date;
                id: string;
                variantId: string | null;
                sku: string;
                productId: string | null;
                orderId: string;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
            }[];
        } & {
            orderNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            deliveryCharge: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            customerNotes: string | null;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            adminNotes: string | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            trackingTokenHash: string | null;
            courierProvider: string | null;
            courierOrderId: string | null;
            courierConsignmentId: string | null;
            courierStatus: string | null;
            courierStatusRaw: string | null;
            courierLastSyncedAt: Date | null;
            courierStatusUpdatedAt: Date | null;
            courierTrackingUrl: string | null;
            courierCreatedAt: Date | null;
            courierResponseMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            paymentReference: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            manualDiscountAmount: import("@prisma/client/runtime/library").Decimal;
            source: string | null;
            createdById: string | null;
            createdByName: string | null;
        });
    }>;
}
