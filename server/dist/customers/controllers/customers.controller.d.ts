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
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            createdAt: Date;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
            addresses: {
                email: string | null;
                phone: string;
                id: string;
                fullName: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                area: string | null;
                postalCode: string | null;
                deliveryInstructions: string | null;
                isDefault: boolean;
            }[];
            measurements: {
                updatedAt: Date;
                chest: import("@prisma/client/runtime/library").Decimal | null;
                shoulder: import("@prisma/client/runtime/library").Decimal | null;
                sleeveLength: import("@prisma/client/runtime/library").Decimal | null;
                collar: import("@prisma/client/runtime/library").Decimal | null;
                waist: import("@prisma/client/runtime/library").Decimal | null;
                trouserLength: import("@prisma/client/runtime/library").Decimal | null;
                garmentLength: import("@prisma/client/runtime/library").Decimal | null;
                tailoringNotes: string | null;
            } | null;
        };
    }>;
    updateProfile(customerId: string, dto: UpdateCustomerProfileDto): Promise<{
        message: string;
        data: {
            email: string | null;
            phone: string;
            firstName: string;
            lastName: string | null;
            preferredSize: string | null;
            preferredFit: string | null;
            marketingConsent: boolean;
            id: string;
            updatedAt: Date;
            secondaryPhone: string | null;
            dateOfBirth: Date | null;
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
                fullName: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                division: string;
                area: string | null;
                postalCode: string | null;
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
            fullName: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            area: string | null;
            postalCode: string | null;
            deliveryInstructions: string | null;
            isDefault: boolean;
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
            fullName: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            area: string | null;
            postalCode: string | null;
            deliveryInstructions: string | null;
            isDefault: boolean;
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
            fullName: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            area: string | null;
            postalCode: string | null;
            deliveryInstructions: string | null;
            isDefault: boolean;
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
            fullName: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            division: string;
            area: string | null;
            postalCode: string | null;
            deliveryInstructions: string | null;
            isDefault: boolean;
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
        };
    }>;
}
