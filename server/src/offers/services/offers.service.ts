import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { QueryOffersDto, QueryAdminOffersDto } from '../dto/query-offers.dto.js';

export interface StorefrontOfferProduct {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: { id: string; name: string; slug: string };
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  badge?: string;
  images: string[];
  imageDetails: Array<{ url: string; altText?: string }>;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  averageRating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  fabric?: string;
  fabricOrigin?: string;
  variants?: Array<{
    id: string;
    size: string;
    color?: string;
    stock: number;
    price?: number;
    isActive: boolean;
  }>;
}

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Main customer storefront offers aggregator
   */
  async getStorefrontOffers(query: QueryOffersDto) {
    const now = new Date();

    // 1. Fetch currently active offers
    const activeOffers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        expiryDate: { gte: now },
      },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        products: { select: { id: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const activeOfferProductIds = new Set(
      activeOffers.flatMap((o) => o.products.map((p) => p.id)),
    );
    const activeOfferCategoryIds = new Set(
      activeOffers.flatMap((o) => o.categories.map((c) => c.id)),
    );
    const hasStorewideOffer = activeOffers.some((o) => o.offerType === 'STOREWIDE');

    // 2. Query products that qualify: active, public, non-deleted
    const rawProducts = await this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, isActive: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, altText: true },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            priceOverride: true,
            isActive: true,
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
        _count: {
          select: {
            reviews: { where: { status: 'APPROVED' } },
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Filter products that are genuinely eligible for an offer or have compareAtPrice > price
    const mappedProducts: StorefrontOfferProduct[] = [];

    for (const prod of rawProducts) {
      if (prod.category && !prod.category.isActive) continue;

      const regularPrice = Number(prod.price);
      const compareAt = prod.compareAtPrice !== null ? Number(prod.compareAtPrice) : null;
      const isDirectlyInOffer = activeOfferProductIds.has(prod.id);
      const isCategoryInOffer = activeOfferCategoryIds.has(prod.categoryId);
      const isEligibleByOffer = hasStorewideOffer || isDirectlyInOffer || isCategoryInOffer;
      const isNaturallyOnSale = compareAt !== null && compareAt > regularPrice;

      if (!isEligibleByOffer && !isNaturallyOnSale) {
        continue;
      }

      // Calculate final pricing & discount
      let effectiveSalePrice = regularPrice;
      let effectiveOriginalPrice: number | undefined = undefined;
      let discountPercentage = 0;
      let offerBadgeText: string | undefined = undefined;

      if (isNaturallyOnSale && compareAt !== null) {
        effectiveOriginalPrice = compareAt;
        effectiveSalePrice = regularPrice;
        discountPercentage = Math.round(
          ((compareAt - regularPrice) / compareAt) * 100,
        );
      } else if (isEligibleByOffer) {
        // Find matching active offer
        const matchedOffer =
          activeOffers.find((o) => o.products.some((p) => p.id === prod.id)) ||
          activeOffers.find((o) => o.categories.some((c) => c.id === prod.categoryId)) ||
          activeOffers.find((o) => o.offerType === 'STOREWIDE');

        if (matchedOffer) {
          const discountVal = Number(matchedOffer.discountValue);
          if (matchedOffer.discountType === 'PERCENTAGE') {
            discountPercentage = Math.min(100, Math.max(1, Math.round(discountVal)));
            effectiveOriginalPrice = regularPrice;
            effectiveSalePrice = Math.max(
              1,
              Math.round(regularPrice * (1 - discountPercentage / 100)),
            );
          } else {
            effectiveOriginalPrice = regularPrice;
            effectiveSalePrice = Math.max(1, regularPrice - discountVal);
            discountPercentage = Math.round(
              ((effectiveOriginalPrice - effectiveSalePrice) / effectiveOriginalPrice) * 100,
            );
          }
          if (matchedOffer.badgeText) {
            offerBadgeText = matchedOffer.badgeText;
          }
        }
      }

      if (discountPercentage <= 0) continue;

      // Extract colors & sizes
      const colorsMap = new Map<string, string>();
      const sizesSet = new Set<string>();
      let totalStock = 0;

      for (const v of prod.variants) {
        if (v.color) colorsMap.set(v.color, colorToHex(v.color));
        if (v.size) sizesSet.add(v.size);
        totalStock += Math.max(0, v.stock);
      }

      const colors = Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
      const sizes = Array.from(sizesSet);
      const inStock = totalStock > 0;

      // Real reviews and rating calculation
      const approvedReviews = prod.reviews;
      const reviewsCount = prod._count.reviews;
      const averageRating =
        approvedReviews.length > 0
          ? Number(
              (
                approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
                approvedReviews.length
              ).toFixed(1),
            )
          : 0;

      const images = prod.images.map((img) => img.url);
      const imageDetails = prod.images.map((img) => ({
        url: img.url,
        altText: img.altText || `${prod.name} Rongin Libas`,
      }));

      mappedProducts.push({
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        sku: prod.sku,
        category: {
          id: prod.category.id,
          name: prod.category.name,
          slug: prod.category.slug,
        },
        price: effectiveSalePrice,
        originalPrice: effectiveOriginalPrice,
        discountPercentage,
        badge: offerBadgeText || `${discountPercentage}% OFF`,
        images,
        imageDetails,
        colors,
        sizes,
        inStock,
        stockCount: totalStock,
        averageRating,
        reviewsCount,
        isFeatured: prod.isFeatured,
        isNewArrival: prod.isNewArrival,
        isBestSeller: prod.isBestSeller,
        fabric: prod.fabric ?? undefined,
        fabricOrigin: prod.fabricOrigin ?? undefined,
        variants: prod.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color ?? undefined,
          stock: Math.max(0, v.stock),
          price: v.priceOverride ? Number(v.priceOverride) : regularPrice,
          isActive: v.isActive,
        })),
      });
    }

    // 4. Compute Facets before applying search/attribute filters
    const categoryCountMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    let band10 = 0;
    let band20 = 0;
    let band30 = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const p of mappedProducts) {
      if (!categoryCountMap.has(p.category.id)) {
        categoryCountMap.set(p.category.id, {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          count: 0,
        });
      }
      categoryCountMap.get(p.category.id)!.count++;

      if (p.discountPercentage >= 10) band10++;
      if (p.discountPercentage >= 20) band20++;
      if (p.discountPercentage >= 30) band30++;

      p.colors.forEach((c) => colorsSet.add(c.name));
      p.sizes.forEach((s) => sizesSet.add(s));

      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }

    const facets = {
      categories: Array.from(categoryCountMap.values()),
      discountBands: [
        { label: '10%+ OFF', min: 10, count: band10 },
        { label: '20%+ OFF', min: 20, count: band20 },
        { label: '30%+ OFF', min: 30, count: band30 },
      ],
      colors: Array.from(colorsSet),
      sizes: Array.from(sizesSet),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    };

    // 5. Apply User Filters
    let filtered = [...mappedProducts];

    // Category filter
    if (query.category) {
      const catLower = query.category.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.category.slug.toLowerCase() === catLower ||
          p.category.name.toLowerCase() === catLower,
      );
    }

    // Discount Band filter (e.g. 10, 20, 30)
    if (query.discountBand) {
      const minBand = Number(query.discountBand);
      if (!Number.isNaN(minBand)) {
        filtered = filtered.filter((p) => p.discountPercentage >= minBand);
      }
    }

    // Price bounds
    if (query.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= query.maxPrice!);
    }

    // Size filter
    if (query.size && query.size.length > 0) {
      const reqSizes = new Set(query.size.map((s) => s.toLowerCase()));
      filtered = filtered.filter((p) =>
        p.sizes.some((s) => reqSizes.has(s.toLowerCase())),
      );
    }

    // Color filter
    if (query.color && query.color.length > 0) {
      const reqColors = new Set(query.color.map((c) => c.toLowerCase()));
      filtered = filtered.filter((p) =>
        p.colors.some((c) => reqColors.has(c.name.toLowerCase())),
      );
    }

    // 6. Sorting & Tabs
    const sort = query.sort || (query.tab === 'best-discounts' ? 'discount-high' : 'featured');

    if (sort === 'discount-high' || query.tab === 'best-discounts') {
      filtered.sort((a, b) => b.discountPercentage - a.discountPercentage);
    } else if (sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      // featured
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    // 7. Pagination
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 24));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedProducts = filtered.slice((page - 1) * limit, page * limit);

    // 8. Customer Active Coupons (valid, within date, not exceeded usage)
    const activeCoupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        expiryDate: { gte: now },
      },
      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        minimumOrderAmount: true,
        maximumDiscount: true,
        expiryDate: true,
        usageLimit: true,
        usageCount: true,
      },
      orderBy: { value: 'desc' },
    });

    const publicCoupons = activeCoupons
      .filter((c) => c.usageLimit === null || c.usageCount < c.usageLimit)
      .map((c) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        type: c.type,
        value: Number(c.value),
        minimumOrderAmount: Number(c.minimumOrderAmount),
        maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
        expiryDate: c.expiryDate.toISOString(),
      }));

    // 9. Free Delivery Policy from Store Settings
    const storeSettings = await this.settingsService.getPublicSettings();
    const freeDeliveryThreshold = Number(storeSettings.freeDeliveryThreshold || 2999);
    const freeDeliveryEnabled = storeSettings.freeShippingEnabled !== false;

    // 10. Countdown calculation: find the nearest upcoming expiration among active offers
    let countdownData: {
      offerName: string;
      startDate: string;
      expiryDate: string;
      isActive: boolean;
    } | null = null;

    const futureExpiringOffers = activeOffers
      .filter((o) => new Date(o.expiryDate).getTime() > now.getTime())
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
      );

    if (futureExpiringOffers.length > 0) {
      const nearest = futureExpiringOffers[0];
      countdownData = {
        offerName: nearest.name,
        startDate: nearest.startDate.toISOString(),
        expiryDate: nearest.expiryDate.toISOString(),
        isActive: true,
      };
    }

    // 11. Dynamic Hero computation
    const primaryActiveOffer = activeOffers[0];
    const maxDiscountInStock = mappedProducts.reduce(
      (max, p) => (p.discountPercentage > max ? p.discountPercentage : max),
      0,
    );

    const hero = {
      title: primaryActiveOffer?.bannerTitle || 'Special Offers',
      subtitle:
        primaryActiveOffer?.bannerSubtitle ||
        'Save more on selected Rongin Libas styles.',
      bannerMessage:
        primaryActiveOffer?.bannerMessage ||
        (maxDiscountInStock > 0 ? `Up to ${maxDiscountInStock}% OFF` : 'Exclusive Atelier Privileges'),
      maxDiscountPercent: maxDiscountInStock,
      hasActivePromotion: activeOffers.length > 0 || mappedProducts.length > 0,
    };

    return {
      hero,
      countdown: countdownData,
      freeDelivery: {
        enabled: freeDeliveryEnabled,
        threshold: freeDeliveryThreshold,
        message: `FREE DELIVERY On orders over ৳${freeDeliveryThreshold.toLocaleString()}`,
      },
      coupons: publicCoupons,
      offers: activeOffers.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        description: o.description,
        offerType: o.offerType,
        discountType: o.discountType,
        discountValue: Number(o.discountValue),
        startDate: o.startDate.toISOString(),
        expiryDate: o.expiryDate.toISOString(),
        badgeText: o.badgeText,
        couponCode: o.couponCode,
        productCount: o.products.length,
      })),
      products: paginatedProducts,
      facets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Admin: List all offers with dynamic status calculation
   */
  async getAdminOffers(query: QueryAdminOffersDto) {
    const now = new Date();
    const where: Prisma.OfferWhereInput = {};

    if (query.search?.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { slug: { contains: query.search.trim(), mode: 'insensitive' } },
        { bannerMessage: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: {
        _count: {
          select: { products: true, categories: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const mapped = offers.map((offer) => {
      let status: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
      if (!offer.isActive) {
        status = 'INACTIVE';
      } else if (now < offer.startDate) {
        status = 'SCHEDULED';
      } else if (now > offer.expiryDate) {
        status = 'EXPIRED';
      } else {
        status = 'ACTIVE';
      }

      return {
        id: offer.id,
        name: offer.name,
        slug: offer.slug,
        description: offer.description,
        bannerTitle: offer.bannerTitle,
        bannerSubtitle: offer.bannerSubtitle,
        bannerMessage: offer.bannerMessage,
        offerType: offer.offerType,
        discountType: offer.discountType,
        discountValue: Number(offer.discountValue),
        startDate: offer.startDate.toISOString(),
        expiryDate: offer.expiryDate.toISOString(),
        isActive: offer.isActive,
        status,
        badgeText: offer.badgeText,
        couponCode: offer.couponCode,
        priority: offer.priority,
        productCount: offer._count.products,
        categoryCount: offer._count.categories,
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
      };
    });

    if (query.status && query.status !== 'ALL') {
      return mapped.filter((o) => o.status === query.status);
    }

    return mapped;
  }

  /**
   * Admin: Get offer detail by ID
   */
  async getAdminOfferById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, sku: true, price: true, slug: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    const now = new Date();
    let status: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
    if (!offer.isActive) status = 'INACTIVE';
    else if (now < offer.startDate) status = 'SCHEDULED';
    else if (now > offer.expiryDate) status = 'EXPIRED';
    else status = 'ACTIVE';

    return {
      ...offer,
      discountValue: Number(offer.discountValue),
      startDate: offer.startDate.toISOString(),
      expiryDate: offer.expiryDate.toISOString(),
      status,
    };
  }

  /**
   * Admin: Create offer
   */
  async createOffer(dto: CreateOfferDto, actor: AdminAuditActor) {
    const slug =
      dto.slug?.trim() ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const existingSlug = await this.prisma.offer.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      throw new BadRequestException(`An offer with slug "${slug}" already exists`);
    }

    const startDate = new Date(dto.startDate);
    const expiryDate = new Date(dto.expiryDate);
    if (startDate >= expiryDate) {
      throw new BadRequestException('Start date must be before expiry date');
    }

    const offer = await this.prisma.offer.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        bannerTitle: dto.bannerTitle?.trim(),
        bannerSubtitle: dto.bannerSubtitle?.trim(),
        bannerMessage: dto.bannerMessage?.trim(),
        offerType: dto.offerType,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        startDate,
        expiryDate,
        isActive: dto.isActive ?? true,
        badgeText: dto.badgeText?.trim(),
        couponCode: dto.couponCode?.trim().toUpperCase(),
        priority: dto.priority ?? 0,
        products: dto.productIds?.length
          ? { connect: dto.productIds.map((id) => ({ id })) }
          : undefined,
        categories: dto.categoryIds?.length
          ? { connect: dto.categoryIds.map((id) => ({ id })) }
          : undefined,
        collections: dto.collectionIds?.length
          ? { connect: dto.collectionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        products: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
        collections: { select: { id: true, name: true } },
      },
    });

    await this.auditService.record({
      actor,
      module: 'offers',
      action: 'OFFER_CREATED',
      entityType: 'offer',
      entityId: offer.id,
      entityLabel: offer.name,
      summary: `Created promotional offer "${offer.name}" (${offer.discountValue}% ${offer.discountType})`,
      after: offer,
    });

    return offer;
  }

  /**
   * Admin: Update offer
   */
  async updateOffer(
    id: string,
    dto: Partial<CreateOfferDto>,
    actor: AdminAuditActor,
  ) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
        categories: { select: { id: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    let startDate = existing.startDate;
    let expiryDate = existing.expiryDate;
    if (dto.startDate) startDate = new Date(dto.startDate);
    if (dto.expiryDate) expiryDate = new Date(dto.expiryDate);

    if (startDate >= expiryDate) {
      throw new BadRequestException('Start date must be before expiry date');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
        ...(dto.bannerTitle !== undefined ? { bannerTitle: dto.bannerTitle?.trim() } : {}),
        ...(dto.bannerSubtitle !== undefined ? { bannerSubtitle: dto.bannerSubtitle?.trim() } : {}),
        ...(dto.bannerMessage !== undefined ? { bannerMessage: dto.bannerMessage?.trim() } : {}),
        ...(dto.offerType !== undefined ? { offerType: dto.offerType } : {}),
        ...(dto.discountType !== undefined ? { discountType: dto.discountType } : {}),
        ...(dto.discountValue !== undefined ? { discountValue: dto.discountValue } : {}),
        ...(dto.startDate !== undefined ? { startDate } : {}),
        ...(dto.expiryDate !== undefined ? { expiryDate } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.badgeText !== undefined ? { badgeText: dto.badgeText?.trim() } : {}),
        ...(dto.couponCode !== undefined ? { couponCode: dto.couponCode?.trim().toUpperCase() } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.productIds !== undefined
          ? {
              products: {
                set: dto.productIds.map((pid) => ({ id: pid })),
              },
            }
          : {}),
        ...(dto.categoryIds !== undefined
          ? {
              categories: {
                set: dto.categoryIds.map((cid) => ({ id: cid })),
              },
            }
          : {}),
        ...(dto.collectionIds !== undefined
          ? {
              collections: {
                set: dto.collectionIds.map((colId) => ({ id: colId })),
              },
            }
          : {}),
      },
      include: {
        products: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
        collections: { select: { id: true, name: true } },
      },
    });

    await this.auditService.record({
      actor,
      module: 'offers',
      action: 'OFFER_UPDATED',
      entityType: 'offer',
      entityId: id,
      entityLabel: updated.name,
      summary: `Updated promotional offer "${updated.name}"`,
      before: existing,
      after: updated,
    });

    return updated;
  }

  /**
   * Admin: Delete offer
   */
  async deleteOffer(id: string, actor: AdminAuditActor) {
    const existing = await this.prisma.offer.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    await this.prisma.offer.delete({
      where: { id },
    });

    await this.auditService.record({
      actor,
      module: 'offers',
      action: 'OFFER_DELETED',
      entityType: 'offer',
      entityId: id,
      entityLabel: existing.name,
      summary: `Deleted promotional offer "${existing.name}"`,
      before: existing,
    });

    return { message: 'Offer deleted successfully' };
  }
}

function colorToHex(name: string): string {
  const normalized = name.toLowerCase().trim();
  const map: Record<string, string> = {
    'heritage olive': '#556b2f',
    'olive': '#556b2f',
    'midnight navy': '#000080',
    'navy': '#000080',
    'royal blue': '#4169e1',
    'emerald': '#073a2d',
    'green': '#073a2d',
    'black': '#1b1c18',
    'white': '#ffffff',
    'maroon': '#800000',
    'burgundy': '#800020',
    'mustard': '#c79a45',
    'gold': '#c79a45',
    'grey': '#717975',
    'gray': '#717975',
    'beige': '#f5f4ed',
    'cream': '#fbf9f2',
  };
  return map[normalized] || '#073a2d';
}
