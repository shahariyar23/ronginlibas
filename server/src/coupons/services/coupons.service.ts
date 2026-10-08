import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { CouponCartItemDto } from '../dto/validate-coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();

    const existing = await this.prisma.coupon.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) throw new ConflictException(`Coupon code ${code} already exists`);
    try {
      return await this.prisma.coupon.create({
        data: {
          code,
          description: dto.description,
          type: dto.type as any,
          value: dto.value,
          minimumOrderAmount: dto.minimumOrderAmount || 0,
          maximumDiscount: dto.maximumDiscount,
          startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
          expiryDate: new Date(dto.expiryDate),
          usageLimit: dto.usageLimit,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(`Coupon code ${code} already exists`);
      }
      throw error;
    }
  }

  async validateCoupon(code: string, items: CouponCartItemDto[]) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    const now = new Date();
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Voucher code is invalid or inactive');
    }
    if (now < coupon.startDate) {
      throw new BadRequestException('Voucher promotion has not commenced yet');
    }
    if (now > coupon.expiryDate) {
      throw new BadRequestException('Voucher promotion has expired');
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Voucher redemption limit has been reached');
    }
    if (new Set(items.map((item) => item.variantId)).size !== items.length) {
      throw new BadRequestException('Each product variant must appear only once');
    }

    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.variantId) },
        isActive: true,
        product: { isActive: true },
      },
      include: { product: { select: { price: true, isActive: true } } },
    });
    if (variants.length !== items.length) {
      throw new BadRequestException('One or more products are unavailable');
    }
    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
    const subtotal = items.reduce((total, item) => {
      const variant = variantsById.get(item.variantId);
      if (!variant || variant.stock < item.quantity) {
        throw new BadRequestException('A cart quantity exceeds available stock');
      }
      const unitPrice = variant.priceOverride
        ? Number(variant.priceOverride)
        : Number(variant.product.price);
      return total + unitPrice * item.quantity;
    }, 0);
    if (subtotal < Number(coupon.minimumOrderAmount)) {
      throw new BadRequestException(
        `Minimum order total of BDT ${coupon.minimumOrderAmount.toString()} required`,
      );
    }

    let discountAmount =
      coupon.type === 'PERCENTAGE'
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    if (coupon.maximumDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
    }
    discountAmount = Math.min(discountAmount, subtotal);
    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      subtotal,
      discountAmount,
      totalAfterDiscount: subtotal - discountAmount,
      currency: 'BDT',
    };
  }

  async update(id: string, partial: Partial<CreateCouponDto>) {
    return this.prisma.coupon.update({ where: { id }, data: partial });
  }

  async remove(id: string) {
    try {
      return await this.prisma.coupon.delete({ where: { id } });
    } catch (error) {
      if (isPrismaError(error, 'P2025')) {
        throw new NotFoundException('Voucher not found');
      }
      throw error;
    }
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaError(error, 'P2002');
}

function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
