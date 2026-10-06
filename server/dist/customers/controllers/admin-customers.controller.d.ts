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
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            addresses: {
                phone: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                postalCode: string | null;
                country: string;
                isDefault: boolean;
            }[];
            orders: {
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
            }[];
        } | {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            email: string;
            isActive: boolean;
            addresses: never[];
            orders: never[];
        };
    }>;
}
