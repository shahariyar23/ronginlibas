var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [items, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    secondaryPhone: true,
                    preferredSize: true,
                    preferredFit: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    addresses: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            addressLine1: true,
                            addressLine2: true,
                            city: true,
                            division: true,
                            postalCode: true,
                            area: true,
                            isDefault: true,
                        },
                        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
                    },
                    orders: {
                        select: {
                            id: true,
                            orderNumber: true,
                            totalAmount: true,
                            shippingAddress: true,
                            status: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: { select: { orders: true, reviews: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({ where }),
        ]);
        const mappedItems = items.map((c) => {
            const orders = c.orders || [];
            const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
            const defaultAddress = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
            let location = defaultAddress
                ? [defaultAddress.city, defaultAddress.division].filter(Boolean).join(', ') || defaultAddress.addressLine1
                : null;
            if (!location) {
                const orderWithAddr = orders.find((o) => o.shippingAddress);
                if (orderWithAddr && typeof orderWithAddr.shippingAddress === 'object') {
                    const sAddr = orderWithAddr.shippingAddress;
                    location = [sAddr.addressLine1, sAddr.city, sAddr.division].filter(Boolean).join(', ') || sAddr.city || null;
                }
            }
            return {
                ...c,
                totalSpent,
                location,
                lastOrderDate: orders[0]?.createdAt || null,
            };
        });
        return {
            items: mappedItems,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                addresses: {
                    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
                },
                measurements: true,
                orders: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        price: true,
                                        images: {
                                            take: 1,
                                            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                                            select: { url: true, altText: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                reviews: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                images: {
                                    take: 1,
                                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                                    select: { url: true, altText: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
        });
        if (!customer)
            throw new NotFoundException('Customer record not found');
        const totalSpent = customer.orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const completedOrders = customer.orders.filter((o) => o.status === 'DELIVERED').length;
        const orderAddresses = customer.orders
            .filter((o) => o.shippingAddress && typeof o.shippingAddress === 'object')
            .map((o) => {
            const sAddr = o.shippingAddress;
            return {
                id: `order-dest-${o.id}`,
                source: 'ORDER_DESTINATION',
                orderNumber: o.orderNumber,
                fullName: sAddr.fullName || `${customer.firstName} ${customer.lastName || ''}`.trim(),
                phone: sAddr.phone || customer.phone,
                addressLine1: sAddr.addressLine1 || '',
                addressLine2: sAddr.addressLine2 || null,
                city: sAddr.city || '',
                division: sAddr.division || '',
                postalCode: sAddr.postalCode || '',
                area: sAddr.area || null,
                deliveryInstructions: sAddr.deliveryInstructions || null,
                isDefault: false,
                createdAt: o.createdAt,
            };
        });
        const existingAddresses = [...customer.addresses];
        const uniqueOrderAddresses = orderAddresses.filter((oa) => {
            return !existingAddresses.some((ea) => ea.addressLine1?.toLowerCase().trim() === oa.addressLine1?.toLowerCase().trim() &&
                ea.city?.toLowerCase().trim() === oa.city?.toLowerCase().trim());
        });
        const combinedAddresses = [...existingAddresses, ...uniqueOrderAddresses];
        return {
            ...customer,
            addresses: combinedAddresses,
            orderAddresses: uniqueOrderAddresses,
            totalSpent,
            completedOrders,
            ordersCount: customer._count?.orders ?? customer.orders.length,
            reviewsCount: customer._count?.reviews ?? customer.reviews.length,
        };
    }
    async findMyProfile(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                secondaryPhone: true,
                dateOfBirth: true,
                preferredSize: true,
                preferredFit: true,
                marketingConsent: true,
                createdAt: true,
                addresses: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        division: true,
                        area: true,
                        postalCode: true,
                        deliveryInstructions: true,
                        isDefault: true,
                    },
                    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
                },
                measurements: {
                    select: {
                        chest: true,
                        shoulder: true,
                        sleeveLength: true,
                        collar: true,
                        waist: true,
                        trouserLength: true,
                        garmentLength: true,
                        tailoringNotes: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!customer)
            throw new NotFoundException('Customer profile not found');
        return customer;
    }
    async updateMyProfile(customerId, dto) {
        try {
            return await this.prisma.customer.update({
                where: { id: customerId },
                data: {
                    ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
                    ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
                    ...(dto.phone !== undefined ? { phone: normalizeBangladeshPhone(dto.phone) } : {}),
                    ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
                    ...(dto.secondaryPhone !== undefined
                        ? { secondaryPhone: normalizeBangladeshPhone(dto.secondaryPhone) }
                        : {}),
                    ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
                    ...(dto.preferredSize !== undefined ? { preferredSize: dto.preferredSize } : {}),
                    ...(dto.preferredFit !== undefined ? { preferredFit: dto.preferredFit } : {}),
                    ...(dto.marketingConsent !== undefined ? { marketingConsent: dto.marketingConsent } : {}),
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    secondaryPhone: true,
                    dateOfBirth: true,
                    preferredSize: true,
                    preferredFit: true,
                    marketingConsent: true,
                    updatedAt: true,
                },
            });
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('The supplied phone number or email is already in use');
            }
            throw error;
        }
    }
    async getDashboard(customerId) {
        const activeStatuses = [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'PACKED',
            'SHIPPED',
            'OUT_FOR_DELIVERY',
        ];
        const [customer, activeOrderCount, activeOrders, recentOrders, wishlistCount] = await Promise.all([
            this.prisma.customer.findUnique({
                where: { id: customerId },
                select: {
                    firstName: true,
                    lastName: true,
                    preferredSize: true,
                    addresses: {
                        where: { isDefault: true },
                        take: 1,
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            addressLine1: true,
                            addressLine2: true,
                            city: true,
                            division: true,
                            area: true,
                            postalCode: true,
                        },
                    },
                },
            }),
            this.prisma.order.count({ where: { customerId, status: { in: [...activeStatuses] } } }),
            this.prisma.order.findMany({
                where: { customerId, status: { in: [...activeStatuses] } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    orderNumber: true,
                    status: true,
                    paymentStatus: true,
                    totalAmount: true,
                    createdAt: true,
                },
            }),
            this.prisma.order.findMany({
                where: { customerId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    orderNumber: true,
                    status: true,
                    paymentStatus: true,
                    totalAmount: true,
                    createdAt: true,
                    items: {
                        select: { productName: true, variantName: true, quantity: true, unitPrice: true },
                    },
                },
            }),
            this.prisma.wishlistItem.count({ where: { customerId } }),
        ]);
        if (!customer)
            throw new NotFoundException('Customer profile not found');
        return {
            customer: {
                name: `${customer.firstName} ${customer.lastName ?? ''}`.trim(),
                preferredSize: customer.preferredSize,
            },
            activeOrderCount,
            activeOrders,
            recentOrders,
            defaultAddress: customer.addresses[0] ?? null,
            wishlistCount,
        };
    }
    async findAddresses(customerId) {
        return this.prisma.address.findMany({
            where: { customerId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                division: true,
                area: true,
                postalCode: true,
                deliveryInstructions: true,
                isDefault: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createAddress(customerId, dto) {
        const currentCount = await this.prisma.address.count({ where: { customerId } });
        const isDefault = dto.isDefault ?? currentCount === 0;
        const data = {
            customerId,
            fullName: dto.fullName.trim(),
            email: dto.email?.toLowerCase(),
            phone: normalizeBangladeshPhone(dto.phone),
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2,
            city: dto.city,
            division: dto.division,
            area: dto.area,
            postalCode: dto.postalCode,
            deliveryInstructions: dto.deliveryInstructions,
            isDefault,
        };
        if (!isDefault) {
            return this.prisma.address.create({ data, select: customerAddressSelect });
        }
        return this.prisma.$transaction(async (transaction) => {
            await transaction.address.updateMany({ where: { customerId }, data: { isDefault: false } });
            return transaction.address.create({ data, select: customerAddressSelect });
        });
    }
    async updateAddress(customerId, addressId, dto) {
        await this.requireOwnedAddress(customerId, addressId);
        const data = {
            ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
            ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
            ...(dto.phone !== undefined ? { phone: normalizeBangladeshPhone(dto.phone) } : {}),
            ...(dto.addressLine1 !== undefined ? { addressLine1: dto.addressLine1 } : {}),
            ...(dto.addressLine2 !== undefined ? { addressLine2: dto.addressLine2 } : {}),
            ...(dto.city !== undefined ? { city: dto.city } : {}),
            ...(dto.division !== undefined ? { division: dto.division } : {}),
            ...(dto.area !== undefined ? { area: dto.area } : {}),
            ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
            ...(dto.deliveryInstructions !== undefined
                ? { deliveryInstructions: dto.deliveryInstructions }
                : {}),
            ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
        };
        if (dto.isDefault !== true) {
            return this.prisma.address.update({
                where: { id: addressId },
                data,
                select: customerAddressSelect,
            });
        }
        return this.prisma.$transaction(async (transaction) => {
            await transaction.address.updateMany({ where: { customerId }, data: { isDefault: false } });
            return transaction.address.update({
                where: { id: addressId },
                data,
                select: customerAddressSelect,
            });
        });
    }
    async setDefaultAddress(customerId, addressId) {
        await this.requireOwnedAddress(customerId, addressId);
        return this.prisma.$transaction(async (transaction) => {
            await transaction.address.updateMany({ where: { customerId }, data: { isDefault: false } });
            return transaction.address.update({
                where: { id: addressId },
                data: { isDefault: true },
                select: customerAddressSelect,
            });
        });
    }
    async deleteAddress(customerId, addressId) {
        await this.requireOwnedAddress(customerId, addressId);
        await this.prisma.address.delete({ where: { id: addressId } });
        return { deleted: true };
    }
    async getMeasurements(customerId) {
        const profile = await this.prisma.customerMeasurementProfile.findUnique({
            where: { customerId },
        });
        if (profile)
            return profile;
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: { preferredSize: true, preferredFit: true },
        });
        if (!customer)
            throw new NotFoundException('Customer profile not found');
        return { ...customer, chest: null, shoulder: null, sleeveLength: null, collar: null, waist: null, trouserLength: null, garmentLength: null, tailoringNotes: null };
    }
    async updateMeasurements(customerId, dto) {
        const data = {
            chest: dto.chest,
            shoulder: dto.shoulder,
            sleeveLength: dto.sleeveLength,
            collar: dto.collar,
            waist: dto.waist,
            trouserLength: dto.trouserLength,
            garmentLength: dto.garmentLength,
            tailoringNotes: dto.tailoringNotes,
        };
        const measurements = await this.prisma.customerMeasurementProfile.upsert({
            where: { customerId },
            create: { customerId, ...data },
            update: data,
        });
        return measurements;
    }
    async requireOwnedAddress(customerId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, customerId },
            select: { id: true },
        });
        if (!address)
            throw new NotFoundException('Address not found');
    }
};
CustomersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CustomersService);
export { CustomersService };
function normalizeBangladeshPhone(phone) {
    const digits = phone.replace(/[\s()-]/g, '');
    return digits.startsWith('+880') ? digits : `+880${digits.slice(1)}`;
}
const customerAddressSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    division: true,
    area: true,
    postalCode: true,
    deliveryInstructions: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true,
};
function isUniqueConstraintError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002');
}
//# sourceMappingURL=customers.service.js.map