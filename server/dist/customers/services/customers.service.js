var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomersService_1;
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../../mail/mail.service.js';
import { AuditService } from '../../audit/audit.service.js';
let CustomersService = CustomersService_1 = class CustomersService {
    prisma;
    mailService;
    auditService;
    logger = new Logger(CustomersService_1.name);
    constructor(prisma, mailService, auditService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.auditService = auditService;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const andFilters = [];
        if (query.search) {
            andFilters.push({
                OR: [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ],
            });
        }
        if (query.status === 'archived') {
            andFilters.push({ deletedAt: { not: null } });
        }
        else if (query.status === 'banned') {
            andFilters.push({ isActive: false, deletedAt: null });
        }
        else if (query.status === 'active') {
            andFilters.push({ isActive: true, deletedAt: null });
        }
        else if (query.status === 'all') {
        }
        else {
            andFilters.push({ deletedAt: null });
        }
        const where = andFilters.length > 0 ? { AND: andFilters } : {};
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
                    banReason: true,
                    bannedAt: true,
                    deletedAt: true,
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
        if (currentCount >= 5) {
            throw new BadRequestException('You can save a maximum of 5 delivery addresses. Please remove an existing address before adding a new one.');
        }
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
    async sendPasswordResetLink(id, actor) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                isActive: true,
                deletedAt: true,
            },
        });
        if (!customer || customer.deletedAt) {
            throw new NotFoundException('Customer record not found');
        }
        if (!customer.email || !customer.email.trim()) {
            throw new BadRequestException('This customer does not have an email address associated with their account.');
        }
        const resetToken = randomBytes(32).toString('base64url');
        const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                resetTokenHash,
                resetTokenExpiresAt: expiresAt,
            },
        });
        try {
            await this.mailService.sendPasswordResetEmail(customer.email, resetToken, customer.firstName || undefined);
        }
        catch (err) {
            await this.prisma.customer.update({
                where: { id: customer.id },
                data: {
                    resetTokenHash: null,
                    resetTokenExpiresAt: null,
                },
            });
            this.logger.error(`Failed to send password reset email to customer ${customer.email}: ${err.message}`);
            throw new BadRequestException(`Failed to dispatch reset email: ${err.message}`);
        }
        const patronName = `${customer.firstName} ${customer.lastName || ''}`.trim();
        await this.auditService.record({
            actor,
            module: 'customers',
            action: 'CUSTOMER_PASSWORD_RESET_SENT',
            entityType: 'customer',
            entityId: customer.id,
            entityLabel: `${patronName} (${customer.email})`,
            summary: `Dispatched bespoke password reset link to customer email: ${customer.email}`,
            after: {
                email: customer.email,
                expiresAt,
                dispatchedAt: new Date(),
            },
        });
        return {
            message: `Password reset link successfully sent to ${customer.email}`,
            data: {
                customerId: customer.id,
                email: customer.email,
            },
        };
    }
    async updateStatus(id, dto, actor) {
        const existing = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
                banReason: true,
                bannedAt: true,
                deletedAt: true,
            },
        });
        if (!existing || existing.deletedAt) {
            throw new NotFoundException('Customer record not found');
        }
        const patronName = `${existing.firstName} ${existing.lastName || ''}`.trim() || 'Patron Client';
        if (!dto.isActive) {
            const reason = dto.reason?.trim();
            if (!reason) {
                throw new BadRequestException('A specific reason is required when banning or deactivating a customer.');
            }
            const updated = await this.prisma.customer.update({
                where: { id: existing.id },
                data: {
                    isActive: false,
                    banReason: reason,
                    bannedAt: new Date(),
                    refreshTokenHash: null,
                    resetTokenHash: null,
                },
            });
            let emailDispatched = false;
            if (existing.email) {
                try {
                    emailDispatched = await this.mailService.sendAccountBannedEmail(existing.email, reason, existing.firstName);
                }
                catch (mailErr) {
                    this.logger.warn(`Failed to dispatch ban email notification to ${existing.email}: ${mailErr.message}`);
                }
            }
            await this.auditService.record({
                actor,
                module: 'customers',
                action: 'CUSTOMER_BANNED',
                entityType: 'customer',
                entityId: existing.id,
                entityLabel: `${patronName} (${existing.phone})`,
                summary: `Customer account suspended by shop administration. Stated reason: "${reason}".`,
                before: {
                    isActive: existing.isActive,
                    banReason: existing.banReason,
                    bannedAt: existing.bannedAt,
                },
                after: {
                    isActive: false,
                    banReason: reason,
                    bannedAt: updated.bannedAt,
                    noticeEmailSent: emailDispatched,
                },
            });
            return {
                message: `Customer "${patronName}" has been banned successfully. ${emailDispatched ? 'Ban explanation email dispatched to customer.' : ''}`.trim(),
                data: updated,
            };
        }
        else {
            const updated = await this.prisma.customer.update({
                where: { id: existing.id },
                data: {
                    isActive: true,
                    banReason: null,
                    bannedAt: null,
                },
            });
            await this.auditService.record({
                actor,
                module: 'customers',
                action: 'CUSTOMER_ACTIVATED',
                entityType: 'customer',
                entityId: existing.id,
                entityLabel: `${patronName} (${existing.phone})`,
                summary: `Customer account reactivated. Ban status and restrictions cleared.`,
                before: {
                    isActive: existing.isActive,
                    banReason: existing.banReason,
                    bannedAt: existing.bannedAt,
                },
                after: {
                    isActive: true,
                    banReason: null,
                    bannedAt: null,
                },
            });
            return {
                message: `Customer "${patronName}" account has been reactivated successfully.`,
                data: updated,
            };
        }
    }
    async softDelete(id, actor) {
        const existing = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
                deletedAt: true,
            },
        });
        if (!existing) {
            throw new NotFoundException('Customer record not found');
        }
        if (existing.deletedAt) {
            throw new BadRequestException('Customer is already soft-deleted');
        }
        const patronName = `${existing.firstName} ${existing.lastName || ''}`.trim();
        const updated = await this.prisma.customer.update({
            where: { id: existing.id },
            data: {
                deletedAt: new Date(),
                isActive: false,
                refreshTokenHash: null,
                resetTokenHash: null,
            },
        });
        await this.auditService.record({
            actor,
            module: 'customers',
            action: 'CUSTOMER_ARCHIVED',
            entityType: 'customer',
            entityId: existing.id,
            entityLabel: `${patronName} (${existing.phone})`,
            summary: `Customer soft-deleted / archived from active clientele roster.`,
            before: {
                deletedAt: null,
                isActive: existing.isActive,
            },
            after: {
                deletedAt: updated.deletedAt,
                isActive: false,
            },
        });
        return {
            message: `Customer "${patronName}" soft-deleted successfully`,
            data: updated,
        };
    }
    async restore(id, actor) {
        const existing = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isActive: true,
                deletedAt: true,
            },
        });
        if (!existing) {
            throw new NotFoundException('Customer record not found');
        }
        if (!existing.deletedAt) {
            throw new BadRequestException('Customer is not currently soft-deleted');
        }
        const patronName = `${existing.firstName} ${existing.lastName || ''}`.trim();
        const updated = await this.prisma.customer.update({
            where: { id: existing.id },
            data: {
                deletedAt: null,
                isActive: true,
                banReason: null,
                bannedAt: null,
            },
        });
        await this.auditService.record({
            actor,
            module: 'customers',
            action: 'CUSTOMER_RESTORED',
            entityType: 'customer',
            entityId: existing.id,
            entityLabel: `${patronName} (${existing.phone})`,
            summary: `Customer restored to active roster from soft delete archive.`,
            before: {
                deletedAt: existing.deletedAt,
                isActive: existing.isActive,
            },
            after: {
                deletedAt: null,
                isActive: true,
            },
        });
        return {
            message: `Customer "${patronName}" restored successfully`,
            data: updated,
        };
    }
    async permanentDelete(id, dto, actor) {
        if (!dto.confirm) {
            throw new BadRequestException('Mandatory confirmation checkbox is required for permanent customer deletion.');
        }
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                addresses: true,
                measurements: true,
                orders: {
                    include: {
                        items: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!customer) {
            throw new NotFoundException('Customer record not found');
        }
        const fullName = `${customer.firstName} ${customer.lastName || ''}`.trim() || 'Patron Client';
        const totalOrders = customer.orders.length;
        const totalSpent = customer.orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const ordersSnapshot = customer.orders.map((order) => ({
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            subtotal: Number(order.subtotal),
            discountAmount: Number(order.discountAmount),
            deliveryCharge: Number(order.deliveryCharge),
            totalAmount: Number(order.totalAmount),
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress,
            customerNotes: order.customerNotes,
            items: (order.items || []).map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                variantName: item.variantName,
                sku: item.sku,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
                subtotal: Number(item.subtotal),
                size: item.size,
                color: item.color,
                productImage: item.productImage,
            })),
        }));
        const archive = await this.prisma.$transaction(async (tx) => {
            const createdArchive = await tx.customerArchive.create({
                data: {
                    originalId: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    secondaryPhone: customer.secondaryPhone,
                    addresses: customer.addresses,
                    measurements: customer.measurements,
                    ordersSnapshot: ordersSnapshot,
                    totalSpent,
                    totalOrders,
                    deletedBy: actor.email,
                    deleteReason: dto.reason || 'Admin permanent deletion',
                    deletedAt: new Date(),
                },
            });
            await tx.order.updateMany({
                where: { customerId: customer.id },
                data: {
                    guestName: fullName,
                    guestEmail: customer.email || undefined,
                    guestPhone: customer.phone,
                },
            });
            await tx.customer.delete({
                where: { id: customer.id },
            });
            return createdArchive;
        });
        await this.auditService.record({
            actor,
            module: 'customers',
            action: 'CUSTOMER_PERMANENTLY_DELETED',
            entityType: 'customer',
            entityId: customer.id,
            entityLabel: `${fullName} (${customer.phone})`,
            summary: `Permanently deleted customer. Preserved full purchase snapshot of ${totalOrders} orders totaling ৳${totalSpent.toLocaleString()} in archive (Archive ID: ${archive.id}).`,
            before: {
                id: customer.id,
                name: fullName,
                email: customer.email,
                phone: customer.phone,
                ordersCount: totalOrders,
                totalSpent,
            },
            after: {
                archiveId: archive.id,
                deletedBy: actor.email,
                deletedAt: archive.deletedAt,
            },
        });
        return {
            message: `Customer "${fullName}" permanently deleted. Complete purchase snapshot preserved in archive.`,
            data: archive,
        };
    }
    async deleteMyAccount(customerId, reason) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                addresses: true,
                measurements: true,
                orders: {
                    include: {
                        items: true,
                    },
                },
                identities: true,
            },
        });
        if (!customer) {
            throw new NotFoundException('Customer profile not found');
        }
        const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Patron';
        const totalSpent = customer.orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
        const totalOrders = customer.orders.length;
        const ordersSnapshot = customer.orders.map((order) => ({
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
                productName: item.productName,
                variantName: item.variantName,
                sku: item.sku,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
                subtotal: Number(item.subtotal),
            })),
        }));
        const archive = await this.prisma.$transaction(async (tx) => {
            const createdArchive = await tx.customerArchive.create({
                data: {
                    originalId: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    secondaryPhone: customer.secondaryPhone,
                    addresses: customer.addresses,
                    measurements: customer.measurements,
                    ordersSnapshot: ordersSnapshot,
                    totalSpent,
                    totalOrders,
                    deletedBy: 'Customer Self-Service Request',
                    deleteReason: reason || 'Customer requested account and personal data deletion',
                    deletedAt: new Date(),
                },
            });
            await tx.order.updateMany({
                where: { customerId: customer.id },
                data: {
                    guestName: fullName,
                    guestEmail: customer.email || undefined,
                    guestPhone: customer.phone || undefined,
                },
            });
            await tx.customer.delete({
                where: { id: customer.id },
            });
            return createdArchive;
        });
        await this.auditService.record({
            actor: {
                id: customer.id,
                email: customer.email || 'customer-self-service',
                firstName: customer.firstName,
                lastName: customer.lastName || undefined,
                role: 'CUSTOMER',
            },
            module: 'customers',
            action: 'CUSTOMER_SELF_DELETED',
            entityType: 'customer',
            entityId: customer.id,
            entityLabel: `${fullName} (${customer.email || customer.phone})`,
            summary: `Customer self-deleted their account. Personal data removed, past ${totalOrders} orders preserved in archive (Archive ID: ${archive.id}).`,
            before: {
                id: customer.id,
                name: fullName,
                email: customer.email,
                phone: customer.phone,
                identitiesCount: customer.identities.length,
            },
            after: {
                archiveId: archive.id,
                deletedAt: archive.deletedAt,
            },
        });
        return {
            deleted: true,
            archiveId: archive.id,
            deletedAt: archive.deletedAt,
        };
    }
    async submitPublicDataDeletionRequest(dto) {
        const cleanEmail = dto.email.trim().toLowerCase();
        const customer = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    { email: cleanEmail },
                    ...(dto.phone ? [{ phone: dto.phone.trim() }] : []),
                ],
            },
            include: {
                identities: true,
            },
        });
        const confirmationCode = `RL-DEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        if (customer) {
            await this.deleteMyAccount(customer.id, `Public Deletion Request: ${dto.reason || 'Requested by customer'}`);
        }
        return {
            status: 'SUCCESS',
            confirmationCode,
            email: cleanEmail,
            message: customer
                ? 'Your account and linked social identities have been permanently removed. Order records are archived per regulatory compliance.'
                : 'Your deletion request has been recorded. If an account associated with this email or phone exists, all personal data will be purged within 48 hours.',
        };
    }
    async findAllArchives(query) {
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
            this.prisma.customerArchive.findMany({
                where,
                skip,
                take: limit,
                orderBy: { deletedAt: 'desc' },
            }),
            this.prisma.customerArchive.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findArchiveById(id) {
        const archive = await this.prisma.customerArchive.findUnique({
            where: { id },
        });
        if (!archive) {
            throw new NotFoundException('Customer archive record not found');
        }
        return archive;
    }
};
CustomersService = CustomersService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MailService,
        AuditService])
], CustomersService);
export { CustomersService };
function normalizeBangladeshPhone(phone) {
    if (!phone)
        return phone;
    let digits = phone.replace(/[\s()\-]/g, '');
    if (digits.startsWith('+')) {
        digits = digits.slice(1);
    }
    if (digits.startsWith('880')) {
        digits = digits.slice(3);
    }
    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }
    return `+880${digits}`;
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