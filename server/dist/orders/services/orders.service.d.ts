import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class OrdersService {
    private readonly prisma;
    private readonly settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    findAll(query: OrderQueryDto): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<{
        customer: {
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
            id: string;
        } | null;
        items: ({
            product: ({
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sortOrder: number;
                    isPrimary: boolean;
                    productId: string;
                    publicId: string | null;
                    altText: string | null;
                }[];
            } & {
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                tags: string[];
                slug: string;
                price: Prisma.Decimal;
                compareAtPrice: Prisma.Decimal | null;
                costPrice: Prisma.Decimal | null;
                sku: string;
                gender: import("@prisma/client").$Enums.Gender;
                fabric: string | null;
                fit: string | null;
                shortDescription: string | null;
                fabricOrigin: string | null;
                gsm: number | null;
                careInstructions: string | null;
                isExpressAvailable: boolean;
                alertThreshold: number;
                deletedAt: Date | null;
                isFeatured: boolean;
                isNewArrival: boolean;
                isBestSeller: boolean;
                categoryId: string;
            }) | null;
            variant: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                measurements: Prisma.JsonValue | null;
                sku: string;
                productId: string;
                size: string;
                color: string;
                sizeLabel: string | null;
                sizeType: string | null;
                stock: number;
                priceOverride: Prisma.Decimal | null;
            } | null;
        } & {
            productImage: string | null;
            id: string;
            createdAt: Date;
            variantId: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            sku: string;
            productId: string | null;
            orderId: string;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        })[];
        trackingEvents: {
            description: string | null;
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            orderId: string;
            customerVisible: boolean;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        orderNumber: string;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        adminNotes: string | null;
    }>;
    findCustomerOrders(customerId: string, query: OrderQueryDto): Promise<{
        items: {
            items: {
                product: {
                    images: {
                        url: string;
                    }[];
                } | null;
                productImage: string | null;
                id: string;
                createdAt: Date;
                variantId: string | null;
                subtotal: Prisma.Decimal;
                discountAmount: Prisma.Decimal;
                sku: string;
                productId: string | null;
                productName: string;
                variantName: string;
                unitPrice: Prisma.Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            deliveryCharge: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            shippingAddress: Prisma.JsonValue;
            customerNotes: string | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findCustomerOrder(customerId: string, orderNumber: string): Promise<{
        items: {
            product: {
                images: {
                    url: string;
                }[];
            } | null;
            productImage: string | null;
            id: string;
            createdAt: Date;
            variantId: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        trackingEvents: {
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        orderNumber: string;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        trackingTokenHash: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        adminNotes: string | null;
    }>;
    create(dto: CreateOrderDto, customerId?: string): Promise<{
        guestTrackingToken?: string | undefined;
        id: string;
        orderNumber: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        createdAt: Date;
        updatedAt: Date;
        items: {
            product: {
                images: {
                    url: string;
                }[];
            } | null;
            productImage: string | null;
            id: string;
            createdAt: Date;
            variantId: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        trackingEvents: {
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
    }>;
    findOrderForAccess(orderNumber: string, customerId?: string, phone?: string, trackingToken?: string): Promise<{
        customer: {
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
        } | null;
        items: {
            product: {
                images: {
                    url: string;
                }[];
            } | null;
            productImage: string | null;
            id: string;
            createdAt: Date;
            variantId: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        orderNumber: string;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        trackingTokenHash: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        trackingEvents: {
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
    }>;
    getOrderForCustomerAccess(orderNumber: string, customerId?: string, phone?: string, trackingToken?: string): Promise<{
        id: string;
        orderNumber: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        createdAt: Date;
        updatedAt: Date;
        items: {
            product: {
                images: {
                    url: string;
                }[];
            } | null;
            productImage: string | null;
            id: string;
            createdAt: Date;
            variantId: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        trackingEvents: {
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
    }>;
    getTracking(orderNumber: string, customerId?: string, phone?: string, trackingToken?: string): Promise<{
        orderNumber: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        trackingEvents: {
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
    }>;
    generateInvoice(orderNumber: string, customerId?: string, phone?: string, trackingToken?: string): Promise<Buffer>;
    private normalizeOrderNumber;
}
