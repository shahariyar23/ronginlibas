import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class AdminCustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: PaginationQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
            addresses: ({
                email: string | null;
                phone: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string | null;
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
                    productImage: string | null;
                    id: string;
                    createdAt: Date;
                    variantId: string | null;
                    subtotal: import("@prisma/client/runtime/library").Decimal;
                    discountAmount: import("@prisma/client/runtime/library").Decimal;
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
            } & {
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
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                deliveryCharge: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue;
                customerNotes: string | null;
                adminNotes: string | null;
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
                customerId: string;
                status: import("@prisma/client").$Enums.ReviewStatus;
                images: string[];
                productId: string;
                rating: number;
                comment: string;
                adminFeedback: string | null;
                adminFeedbackAt: Date | null;
            })[];
            measurements: {
                id: string;
                updatedAt: Date;
                chest: import("@prisma/client/runtime/library").Decimal | null;
                shoulder: import("@prisma/client/runtime/library").Decimal | null;
                sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
                collar: import("@prisma/client/runtime/library").Decimal | null;
                waist: import("@prisma/client/runtime/library").Decimal | null;
                trouserLength: import("@prisma/client/runtime/library").Decimal | null;
                garmentLength: import("@prisma/client/runtime/library").Decimal | null;
                tailoringNotes: string | null;
                customerId: string;
            } | null;
            _count: {
                orders: number;
                reviews: number;
            };
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            passwordHash: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            refreshTokenHash: string | null;
            resetTokenHash: string | null;
            resetTokenExpiresAt: Date | null;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
        };
    }>;
}
