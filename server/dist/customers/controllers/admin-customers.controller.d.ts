import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CustomerQueryDto, UpdateCustomerStatusDto, PermanentDeleteCustomerDto } from '../dto/admin-customer.dto.js';
import type { AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminCustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: CustomerQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findAllArchives(query: PaginationQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findArchiveById(id: string): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            id: string;
            deletedAt: Date;
            secondaryPhone: string | null;
            addresses: import("@prisma/client/runtime/library").JsonValue | null;
            measurements: import("@prisma/client/runtime/library").JsonValue | null;
            originalId: string;
            ordersSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            deletedBy: string | null;
            deleteReason: string | null;
        };
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
            addresses: ({
                email: string | null;
                phone: string;
                fullName: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                area: string | null;
                postalCode: string | null;
                deliveryInstructions: string | null;
                isDefault: boolean;
                customerId: string;
                country: string;
            } | {
                id: string;
                source: string;
                orderNumber: string;
                fullName: any;
                phone: any;
                addressLine1: any;
                addressLine2: any;
                city: any;
                division: any;
                postalCode: any;
                area: any;
                deliveryInstructions: any;
                isDefault: boolean;
                createdAt: Date;
            })[];
            orderAddresses: {
                id: string;
                source: string;
                orderNumber: string;
                fullName: any;
                phone: any;
                addressLine1: any;
                addressLine2: any;
                city: any;
                division: any;
                postalCode: any;
                area: any;
                deliveryInstructions: any;
                isDefault: boolean;
                createdAt: Date;
            }[];
            totalSpent: number;
            completedOrders: number;
            ordersCount: number;
            reviewsCount: number;
            orders: ({
                items: ({
                    product: {
                        id: string;
                        name: string;
                        slug: string;
                        price: import("@prisma/client/runtime/library").Decimal;
                        images: {
                            url: string;
                            altText: string | null;
                        }[];
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    discountAmount: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    sku: string;
                    productImage: string | null;
                    productId: string | null;
                    orderId: string;
                    productName: string;
                    variantName: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                    size: string | null;
                    color: string | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
                customerId: string | null;
                guestName: string | null;
                guestEmail: string | null;
                guestPhone: string | null;
                trackingTokenHash: string | null;
            })[];
            reviews: ({
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                    images: {
                        url: string;
                        altText: string | null;
                    }[];
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ReviewStatus;
                images: string[];
                productId: string;
                customerId: string;
                rating: number;
                comment: string;
                adminFeedback: string | null;
                adminFeedbackAt: Date | null;
            })[];
            measurements: {
                id: string;
                updatedAt: Date;
                customerId: string;
                chest: import("@prisma/client/runtime/library").Decimal | null;
                shoulder: import("@prisma/client/runtime/library").Decimal | null;
                sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
                collar: import("@prisma/client/runtime/library").Decimal | null;
                waist: import("@prisma/client/runtime/library").Decimal | null;
                trouserLength: import("@prisma/client/runtime/library").Decimal | null;
                garmentLength: import("@prisma/client/runtime/library").Decimal | null;
                tailoringNotes: string | null;
            } | null;
            _count: {
                orders: number;
                reviews: number;
            };
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            passwordHash: string | null;
            photoUrl: string | null;
            isActive: boolean;
            banReason: string | null;
            bannedAt: Date | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            refreshTokenHash: string | null;
            resetTokenHash: string | null;
            resetTokenExpiresAt: Date | null;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
        };
    }>;
    sendPasswordResetLink(id: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            customerId: string;
            email: string;
        };
    }>;
    updateStatus(id: string, dto: UpdateCustomerStatusDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            passwordHash: string | null;
            photoUrl: string | null;
            isActive: boolean;
            banReason: string | null;
            bannedAt: Date | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            refreshTokenHash: string | null;
            resetTokenHash: string | null;
            resetTokenExpiresAt: Date | null;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
        };
    }>;
    softDelete(id: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            passwordHash: string | null;
            photoUrl: string | null;
            isActive: boolean;
            banReason: string | null;
            bannedAt: Date | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            refreshTokenHash: string | null;
            resetTokenHash: string | null;
            resetTokenExpiresAt: Date | null;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
        };
    }>;
    restore(id: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            passwordHash: string | null;
            photoUrl: string | null;
            isActive: boolean;
            banReason: string | null;
            bannedAt: Date | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            refreshTokenHash: string | null;
            resetTokenHash: string | null;
            resetTokenExpiresAt: Date | null;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
        };
    }>;
    permanentDelete(id: string, dto: PermanentDeleteCustomerDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            id: string;
            deletedAt: Date;
            secondaryPhone: string | null;
            addresses: import("@prisma/client/runtime/library").JsonValue | null;
            measurements: import("@prisma/client/runtime/library").JsonValue | null;
            originalId: string;
            ordersSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            deletedBy: string | null;
            deleteReason: string | null;
        };
    }>;
}
