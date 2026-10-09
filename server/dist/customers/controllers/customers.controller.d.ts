import { CustomersService } from '../services/customers.service.js';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto.js';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto.js';
import { MeasurementProfileDto } from '../dto/measurement-profile.dto.js';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    getProfile(customerId: string): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            lastName: string | null;
            firstName: string;
            id: string;
            createdAt: Date;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            addresses: {
                email: string | null;
                phone: string;
                id: string;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                postalCode: string | null;
                isDefault: boolean;
                fullName: string | null;
                area: string | null;
                deliveryInstructions: string | null;
            }[];
            measurements: {
                chest: import("@prisma/client/runtime/library").Decimal | null;
                shoulder: import("@prisma/client/runtime/library").Decimal | null;
                sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
                collar: import("@prisma/client/runtime/library").Decimal | null;
                waist: import("@prisma/client/runtime/library").Decimal | null;
                trouserLength: import("@prisma/client/runtime/library").Decimal | null;
                garmentLength: import("@prisma/client/runtime/library").Decimal | null;
                tailoringNotes: string | null;
                updatedAt: Date;
            } | null;
        };
    }>;
    updateProfile(customerId: string, dto: UpdateCustomerProfileDto): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            lastName: string | null;
            firstName: string;
            id: string;
            updatedAt: Date;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
        };
    }>;
    getDashboard(customerId: string): Promise<{
        message: string;
        data: {
            customer: {
                name: string;
                preferredSize: string | null;
            };
            activeOrderCount: number;
            activeOrders: {
                createdAt: Date;
                orderNumber: string;
                status: import("@prisma/client").$Enums.OrderStatus;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
            }[];
            recentOrders: {
                items: {
                    productName: string;
                    variantName: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                }[];
                createdAt: Date;
                orderNumber: string;
                status: import("@prisma/client").$Enums.OrderStatus;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
            }[];
            defaultAddress: {
                phone: string;
                id: string;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                postalCode: string | null;
                fullName: string | null;
                area: string | null;
            };
            wishlistCount: number;
        };
    }>;
    findAddresses(customerId: string): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            postalCode: string | null;
            isDefault: boolean;
            fullName: string | null;
            area: string | null;
            deliveryInstructions: string | null;
        }[];
    }>;
    createAddress(customerId: string, dto: CreateAddressDto): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            postalCode: string | null;
            isDefault: boolean;
            fullName: string | null;
            area: string | null;
            deliveryInstructions: string | null;
        };
    }>;
    setDefaultAddress(customerId: string, addressId: string): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            postalCode: string | null;
            isDefault: boolean;
            fullName: string | null;
            area: string | null;
            deliveryInstructions: string | null;
        };
    }>;
    updateAddress(customerId: string, addressId: string, dto: UpdateAddressDto): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            postalCode: string | null;
            isDefault: boolean;
            fullName: string | null;
            area: string | null;
            deliveryInstructions: string | null;
        };
    }>;
    deleteAddress(customerId: string, addressId: string): Promise<{
        message: string;
        data: {
            deleted: boolean;
        };
    }>;
    getMeasurements(customerId: string): Promise<{
        message: string;
        data: {
            chest: import("@prisma/client/runtime/library").Decimal | null;
            shoulder: import("@prisma/client/runtime/library").Decimal | null;
            sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
            collar: import("@prisma/client/runtime/library").Decimal | null;
            waist: import("@prisma/client/runtime/library").Decimal | null;
            trouserLength: import("@prisma/client/runtime/library").Decimal | null;
            garmentLength: import("@prisma/client/runtime/library").Decimal | null;
            tailoringNotes: string | null;
            id: string;
            updatedAt: Date;
            customerId: string;
        } | {
            chest: null;
            shoulder: null;
            sleeveLength: null;
            collar: null;
            waist: null;
            trouserLength: null;
            garmentLength: null;
            tailoringNotes: null;
            preferredSize: string | null;
            preferredFit: string | null;
        };
    }>;
    updateMeasurements(customerId: string, dto: MeasurementProfileDto): Promise<{
        message: string;
        data: {
            chest: import("@prisma/client/runtime/library").Decimal | null;
            shoulder: import("@prisma/client/runtime/library").Decimal | null;
            sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
            collar: import("@prisma/client/runtime/library").Decimal | null;
            waist: import("@prisma/client/runtime/library").Decimal | null;
            trouserLength: import("@prisma/client/runtime/library").Decimal | null;
            garmentLength: import("@prisma/client/runtime/library").Decimal | null;
            tailoringNotes: string | null;
            id: string;
            updatedAt: Date;
            customerId: string;
        };
    }>;
}
