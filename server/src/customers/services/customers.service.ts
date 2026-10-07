import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination-query.dto.js';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto.js';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto.js';
import { MeasurementProfileDto } from '../dto/measurement-profile.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = query.search
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
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer record not found');
    return customer;
  }

    async findMyProfile(customerId: string) {
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
      if (!customer) throw new NotFoundException('Customer profile not found');
      return customer;
    }

    async updateMyProfile(customerId: string, dto: UpdateCustomerProfileDto) {
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
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictException('The supplied phone number or email is already in use');
        }
        throw error;
      }
    }

    async getDashboard(customerId: string) {
      const activeStatuses = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
      ] as const;
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
      if (!customer) throw new NotFoundException('Customer profile not found');
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

    async findAddresses(customerId: string) {
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

    async createAddress(customerId: string, dto: CreateAddressDto) {
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

    async updateAddress(customerId: string, addressId: string, dto: UpdateAddressDto) {
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

    async setDefaultAddress(customerId: string, addressId: string) {
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

    async deleteAddress(customerId: string, addressId: string) {
      await this.requireOwnedAddress(customerId, addressId);
      await this.prisma.address.delete({ where: { id: addressId } });
      return { deleted: true };
    }

    async getMeasurements(customerId: string) {
      const profile = await this.prisma.customerMeasurementProfile.findUnique({
        where: { customerId },
      });
      if (profile) return profile;
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { preferredSize: true, preferredFit: true },
      });
      if (!customer) throw new NotFoundException('Customer profile not found');
      return { ...customer, chest: null, shoulder: null, sleeveLength: null, collar: null, waist: null, trouserLength: null, garmentLength: null, tailoringNotes: null };
    }

    async updateMeasurements(customerId: string, dto: MeasurementProfileDto) {
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

    private async requireOwnedAddress(customerId: string, addressId: string) {
      const address = await this.prisma.address.findFirst({
        where: { id: addressId, customerId },
        select: { id: true },
      });
      if (!address) throw new NotFoundException('Address not found');
    }
  }

  function normalizeBangladeshPhone(phone: string): string {
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
  } satisfies Prisma.AddressSelect;

  function isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }
