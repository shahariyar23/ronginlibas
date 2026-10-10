import { OrdersService } from '../services/orders.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminOrdersController {
    private readonly ordersService;
    private readonly auditService;
    constructor(ordersService: OrdersService, auditService: AuditService);
    findAll(query: OrderQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
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
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
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
                    categoryId: string;
                }) | null;
                variant: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    measurements: import("@prisma/client/runtime/library").JsonValue | null;
                    sku: string;
                    productId: string;
                    size: string;
                    color: string;
                    sizeLabel: string | null;
                    sizeType: string | null;
                    stock: number;
                    priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                } | null;
            } & {
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                variantId: string | null;
                sku: string;
                productId: string | null;
                orderId: string;
                productName: string;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
        };
    }>;
    updateOrder(id: string, dto: UpdateOrderStatusDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            customer: {
                email: string | null;
                phone: string;
                firstName: string;
                lastName: string | null;
                id: string;
            } | null;
            items: {
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                variantId: string | null;
                sku: string;
                productId: string | null;
                orderId: string;
                productName: string;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            trackingTokenHash: string | null;
        };
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            customer: {
                email: string | null;
                phone: string;
                firstName: string;
                lastName: string | null;
                id: string;
            } | null;
            items: {
                productImage: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                variantId: string | null;
                sku: string;
                productId: string | null;
                orderId: string;
                productName: string;
                variantName: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                size: string | null;
                color: string | null;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            trackingTokenHash: string | null;
        };
    }>;
}
