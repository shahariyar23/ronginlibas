import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { MailService } from '../../mail/mail.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class OrdersService {
    private readonly prisma;
    private readonly settingsService;
    private readonly mailService?;
    private readonly logger;
    constructor(prisma: PrismaService, settingsService: SettingsService, mailService?: MailService | undefined);
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
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
                isFeatured: boolean;
                isNewArrival: boolean;
                isBestSeller: boolean;
                seoTitle: string | null;
                metaDescription: string | null;
                canonicalUrl: string | null;
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
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
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
            status: import("@prisma/client").$Enums.OrderStatus;
            id: string;
            createdAt: Date;
            orderId: string;
            customerVisible: boolean;
        }[];
        orderNumber: string;
        subtotal: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        adminNotes: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
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
                subtotal: Prisma.Decimal;
                discountAmount: Prisma.Decimal;
                id: string;
                createdAt: Date;
                variantId: string | null;
                sku: string;
                productId: string | null;
                productName: string;
                variantName: string;
                unitPrice: Prisma.Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
            }[];
            orderNumber: string;
            subtotal: Prisma.Decimal;
            deliveryCharge: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            shippingAddress: Prisma.JsonValue;
            customerNotes: string | null;
            courierName: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        orderNumber: string;
        subtotal: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        trackingEvents: {
            description: string | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
        }[];
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        customer: {
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
            id: string;
        } | null;
        items: {
            productImage: string | null;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
            sku: string;
            productId: string | null;
            orderId: string;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
    } & {
        orderNumber: string;
        subtotal: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        adminNotes: string | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        trackingTokenHash: string | null;
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
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
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
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
        }[];
    }>;
    private dispatchOrderConfirmationNotification;
    private saveAddressForCustomerIfEligible;
    private dispatchOrderStatusOrEditNotification;
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
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
            sku: string;
            productId: string | null;
            productName: string;
            variantName: string;
            unitPrice: Prisma.Decimal;
            quantity: number;
            size: string | null;
            color: string | null;
        }[];
        orderNumber: string;
        subtotal: Prisma.Decimal;
        deliveryCharge: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: Prisma.JsonValue;
        customerNotes: string | null;
        courierName: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        estimatedDelivery: Date | null;
        status: import("@prisma/client").$Enums.OrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        trackingTokenHash: string | null;
        trackingEvents: {
            description: string | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
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
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            id: string;
            createdAt: Date;
            variantId: string | null;
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
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
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
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
        }[];
    }>;
    generateInvoice(orderNumber: string, customerId?: string, phone?: string, trackingToken?: string): Promise<Buffer>;
    generateInvoiceBuffer(order: any): Promise<Buffer>;
    private normalizeOrderNumber;
}
