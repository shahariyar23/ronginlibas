var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductsService_1;
import { Logger, Injectable, BadRequestException, NotFoundException, ConflictException, Optional, } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { WishlistService } from '../../wishlist/wishlist.service.js';
let ProductsService = ProductsService_1 = class ProductsService {
    prisma;
    cloudinary;
    wishlistService;
    logger = new Logger(ProductsService_1.name);
    constructor(prisma, cloudinary, wishlistService) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.wishlistService = wishlistService;
    }
    async findAll(query, isAdmin = false) {
        this.validatePriceRange(query);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = buildProductWhere(query, isAdmin);
        const isBestSellingSort = query.sort === 'best-selling' ||
            (query.bestSeller === true && (!query.sort || query.sort === 'featured' || query.sort === 'newest'));
        const orderBy = query.sort === 'price-asc' || query.sort === 'price-low'
            ? { price: 'asc' }
            : query.sort === 'price-desc' || query.sort === 'price-high'
                ? { price: 'desc' }
                : isBestSellingSort
                    ? [{ orderItems: { _count: 'desc' } }, { isBestSeller: 'desc' }, { createdAt: 'desc' }]
                    : query.sort === 'featured'
                        ? [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
                        : { createdAt: 'desc' };
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                    variants: {
                        where: isAdmin ? undefined : { isActive: true },
                        select: {
                            id: true,
                            size: true,
                            sizeLabel: true,
                            sizeType: true,
                            measurements: true,
                            color: true,
                            sku: true,
                            stock: true,
                            isActive: true,
                            priceOverride: true,
                        },
                    },
                    reviews: {
                        where: { status: 'APPROVED' },
                        select: { rating: true },
                    },
                    orderItems: {
                        where: { order: { status: { not: 'CANCELLED' } } },
                        select: { quantity: true },
                    },
                },
                orderBy,
            }),
            this.prisma.product.count({ where }),
        ]);
        const mappedItems = isAdmin ? items : items.map(normalizeStorefrontSizeLabels);
        if (isBestSellingSort) {
            mappedItems.sort((a, b) => {
                const soldA = a.totalSold !== undefined
                    ? a.totalSold
                    : (a.orderItems ?? []).reduce((sum, oi) => sum + (oi.quantity || 1), 0);
                const soldB = b.totalSold !== undefined
                    ? b.totalSold
                    : (b.orderItems ?? []).reduce((sum, oi) => sum + (oi.quantity || 1), 0);
                if (soldB !== soldA)
                    return soldB - soldA;
                const flagA = a.isBestSeller ? 1 : 0;
                const flagB = b.isBestSeller ? 1 : 0;
                if (flagB !== flagA)
                    return flagB - flagA;
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            });
        }
        return {
            items: mappedItems,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getFilters(query) {
        this.validatePriceRange(query);
        const productWhere = buildProductWhere(query, false);
        const categoryWhere = buildProductWhere(query, false, 'category');
        const sizeWhere = buildProductWhere(query, false, 'size');
        const colorWhere = buildProductWhere(query, false, 'color');
        const fabricWhere = buildProductWhere(query, false, 'fabric');
        const originWhere = buildProductWhere(query, false, 'fabricOrigin');
        const fitWhere = buildProductWhere(query, false, 'fit');
        const [categories, sizes, colors, fabrics, fabricOrigins, fits, price] = await Promise.all([
            this.prisma.category.findMany({
                where: { isActive: true, products: { some: categoryWhere } },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    _count: { select: { products: { where: categoryWhere } } },
                },
                orderBy: { sortOrder: 'asc' },
            }),
            this.prisma.productVariant.findMany({
                where: { isActive: true, product: sizeWhere },
                select: {
                    size: true,
                    sizeLabel: true,
                    sizeType: true,
                    product: { select: { category: { select: { slug: true } } } },
                },
            }),
            this.prisma.productVariant.groupBy({
                by: ['color'],
                where: { isActive: true, product: colorWhere },
                _count: { _all: true },
                orderBy: { color: 'asc' },
            }),
            this.prisma.product.groupBy({
                by: ['fabric'],
                where: { ...fabricWhere, fabric: { not: null } },
                _count: { _all: true },
                orderBy: { fabric: 'asc' },
            }),
            this.prisma.product.groupBy({
                by: ['fabricOrigin'],
                where: { ...originWhere, fabricOrigin: { not: null } },
                _count: { _all: true },
                orderBy: { fabricOrigin: 'asc' },
            }),
            this.prisma.product.groupBy({
                by: ['fit'],
                where: { ...fitWhere, fit: { not: null } },
                _count: { _all: true },
                orderBy: { fit: 'asc' },
            }),
            this.prisma.product.aggregate({
                where: productWhere,
                _min: { price: true },
                _max: { price: true },
            }),
        ]);
        const sizeCounts = new Map();
        for (const variant of sizes) {
            const value = getShopSizeLabel(variant);
            if (!value)
                continue;
            const type = getShopSizeType(variant, value);
            const key = `${type}:${value}`;
            const current = sizeCounts.get(key);
            sizeCounts.set(key, { value, type, count: (current?.count ?? 0) + 1 });
        }
        const sizeTypeOrder = { APPAREL: 0, WAIST: 1, CUSTOM: 2 };
        const sizeOptions = [...sizeCounts.values()].sort((a, b) => sizeTypeOrder[a.type] - sizeTypeOrder[b.type] ||
            a.value.localeCompare(b.value, undefined, { numeric: true }));
        return {
            categories: categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                count: category._count.products,
            })),
            sizes: sizeOptions,
            colors: colors.map((item) => ({
                name: item.color,
                slug: toSlug(item.color),
                count: item._count._all,
            })),
            fabrics: fabrics.flatMap((item) => item.fabric
                ? [{ name: item.fabric, slug: toSlug(item.fabric), count: item._count._all }]
                : []),
            fabricOrigins: fabricOrigins.flatMap((item) => item.fabricOrigin
                ? [
                    {
                        name: item.fabricOrigin,
                        slug: toSlug(item.fabricOrigin),
                        count: item._count._all,
                    },
                ]
                : []),
            fits: fits.flatMap((item) => item.fit ? [{ name: item.fit, slug: toSlug(item.fit), count: item._count._all }] : []),
            price: {
                min: Number(price._min.price ?? 0),
                max: Number(price._max.price ?? 0),
            },
        };
    }
    validatePriceRange(query) {
        if (query.minPrice !== undefined &&
            query.maxPrice !== undefined &&
            query.minPrice > query.maxPrice) {
            throw new BadRequestException('minPrice cannot be greater than maxPrice');
        }
    }
    async findBySlug(slug) {
        const product = await this.prisma.product.findFirst({
            where: { OR: [{ slug }, { id: slug }], isActive: true, deletedAt: null },
            include: {
                category: true,
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
                reviews: {
                    where: { status: 'APPROVED' },
                    include: {
                        customer: { select: { firstName: true, lastName: true } },
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                orderItems: {
                    where: { order: { status: { not: 'CANCELLED' } } },
                    select: { quantity: true },
                },
            },
        });
        if (product) {
            return normalizeStorefrontSizeLabels(product);
        }
        const redirect = await this.prisma.productSlugRedirect?.findUnique({
            where: { sourceSlug: slug },
        });
        if (redirect) {
            const redirectedProduct = await this.prisma.product.findFirst({
                where: { id: redirect.productId, isActive: true, deletedAt: null },
                include: {
                    category: true,
                    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                    variants: { where: { isActive: true } },
                    reviews: {
                        where: { status: 'APPROVED' },
                        include: {
                            customer: { select: { firstName: true, lastName: true } },
                        },
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                    },
                    orderItems: {
                        where: { order: { status: { not: 'CANCELLED' } } },
                        select: { quantity: true },
                    },
                },
            });
            if (redirectedProduct) {
                const normalized = normalizeStorefrontSizeLabels(redirectedProduct);
                return {
                    ...normalized,
                    isRedirect: true,
                    redirectTargetSlug: redirect.targetSlug,
                };
            }
        }
        throw new NotFoundException(`Garment not found with slug or ID: ${slug}`);
    }
    async findById(id) {
        const product = await this.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            include: {
                category: true,
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
            },
        });
        if (!product)
            throw new NotFoundException(`Garment not found with identifier: ${id}`);
        return product;
    }
    async findRelated(slug, relationType) {
        const product = await this.prisma.product.findFirst({
            where: { OR: [{ slug }, { id: slug }], isActive: true, deletedAt: null },
            select: { id: true, categoryId: true },
        });
        if (!product)
            throw new NotFoundException(`Garment not found with slug: ${slug}`);
        const relations = await this.prisma.productRelation.findMany({
            where: {
                sourceProductId: product.id,
                relationType,
                targetProduct: { isActive: true, deletedAt: null },
            },
            orderBy: { sortOrder: 'asc' },
            take: 8,
            select: {
                targetProduct: {
                    include: {
                        category: { select: { id: true, name: true, slug: true } },
                        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                        variants: { where: { isActive: true } },
                        reviews: {
                            where: { status: 'APPROVED' },
                            select: { rating: true },
                        },
                        orderItems: {
                            where: { order: { status: { not: 'CANCELLED' } } },
                            select: { quantity: true },
                        },
                    },
                },
            },
        });
        if (relations.length) {
            return relations.map((relation) => normalizeStorefrontSizeLabels(relation.targetProduct));
        }
        const relatedProducts = await this.prisma.product.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                categoryId: product.categoryId,
                id: { not: product.id },
            },
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
                reviews: {
                    where: { status: 'APPROVED' },
                    select: { rating: true },
                },
                orderItems: {
                    where: { order: { status: { not: 'CANCELLED' } } },
                    select: { quantity: true },
                },
            },
        });
        return relatedProducts.map(normalizeStorefrontSizeLabels);
    }
    async generateUniqueSlug(rawSlugOrName, excludeId) {
        const baseSlug = rawSlugOrName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || 'product';
        let candidate = baseSlug;
        let counter = 1;
        while (true) {
            const existingProduct = await this.prisma.product.findFirst({
                where: {
                    slug: candidate,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
                select: { id: true },
            });
            const existingRedirect = await this.prisma.productSlugRedirect?.findFirst({
                where: {
                    sourceSlug: candidate,
                    ...(excludeId ? { productId: { not: excludeId } } : {}),
                },
                select: { id: true },
            });
            if (!existingProduct && !existingRedirect) {
                return candidate;
            }
            counter += 1;
            candidate = `${baseSlug}-${counter}`;
        }
    }
    async create(dto) {
        const slug = await this.generateUniqueSlug(dto.slug || dto.name);
        try {
            const existing = await this.prisma.product.findFirst({
                where: { sku: dto.sku },
            });
            if (existing) {
                throw new ConflictException('A product with this SKU already exists in the catalog');
            }
            return await this.prisma.product.create({
                data: {
                    name: dto.name,
                    slug,
                    description: dto.description,
                    seoTitle: dto.seoTitle,
                    metaDescription: dto.metaDescription,
                    canonicalUrl: dto.canonicalUrl,
                    price: dto.price,
                    compareAtPrice: dto.compareAtPrice,
                    costPrice: dto.costPrice,
                    sku: dto.sku,
                    gender: dto.gender || 'MEN',
                    fabric: dto.fabric,
                    fit: dto.fit,
                    isActive: dto.isActive ?? true,
                    isFeatured: dto.isFeatured ?? false,
                    isNewArrival: dto.isNewArrival ?? false,
                    isBestSeller: dto.isBestSeller ?? false,
                    tags: normalizeProductTags(dto.tags),
                    categoryId: dto.categoryId,
                    alertThreshold: dto.alertThreshold ?? 5,
                    variants: dto.variants?.length
                        ? {
                            create: dto.variants.map((v) => ({
                                size: v.sizeLabel ? normalizeCanonicalSizeLabel(v.sizeLabel) : v.size,
                                sizeLabel: v.sizeLabel
                                    ? normalizeCanonicalSizeLabel(v.sizeLabel)
                                    : undefined,
                                sizeType: v.sizeType,
                                color: v.color,
                                sku: v.sku,
                                stock: v.stock,
                                priceOverride: v.priceOverride,
                                measurements: v.measurements,
                            })),
                        }
                        : undefined,
                    images: dto.images?.length
                        ? {
                            create: dto.images.map((img) => ({
                                url: img.url,
                                publicId: img.publicId,
                                altText: img.altText,
                                sortOrder: img.sortOrder ?? 0,
                                isPrimary: img.isPrimary ?? false,
                            })),
                        }
                        : undefined,
                },
                include: {
                    variants: true,
                    images: true,
                },
            });
        }
        catch (err) {
            if (err instanceof ConflictException)
                throw err;
            if (isUniqueConstraintError(err)) {
                throw new ConflictException('A product with this SKU or slug already exists in the catalog');
            }
            throw err;
        }
    }
    async update(id, dto) {
        const existing = await this.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: { id: true, slug: true },
        });
        if (!existing)
            throw new NotFoundException(`Garment not found: ${id}`);
        const targetId = existing.id;
        const currentSlug = existing.slug;
        if (dto.categoryId !== undefined) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new NotFoundException(`Category not found with id: ${dto.categoryId}`);
            }
        }
        let targetSlug;
        if (dto.slug) {
            const cleanedSlug = dto.slug
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            if (cleanedSlug && cleanedSlug !== currentSlug) {
                const inUse = await this.prisma.product.findFirst({
                    where: { slug: cleanedSlug, id: { not: targetId } },
                    select: { id: true },
                });
                if (inUse) {
                    throw new ConflictException(`A product with slug "${cleanedSlug}" already exists in the catalog`);
                }
                targetSlug = cleanedSlug;
            }
        }
        const previousImages = await this.prisma.productImage.findMany({
            where: { productId: targetId },
            select: { publicId: true },
        });
        let wasRestocked = false;
        const updatedProduct = await this.prisma.$transaction(async (transaction) => {
            if (targetSlug) {
                await transaction.productSlugRedirect.upsert({
                    where: { sourceSlug: currentSlug },
                    create: {
                        sourceSlug: currentSlug,
                        targetSlug,
                        productId: targetId,
                    },
                    update: {
                        targetSlug,
                        productId: targetId,
                    },
                });
                await transaction.productSlugRedirect.updateMany({
                    where: { targetSlug: currentSlug },
                    data: { targetSlug },
                });
                await transaction.productSlugRedirect.deleteMany({
                    where: { sourceSlug: targetSlug },
                });
            }
            await transaction.product.update({
                where: { id: targetId },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(targetSlug && { slug: targetSlug }),
                    ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
                    ...(dto.metaDescription !== undefined && {
                        metaDescription: dto.metaDescription,
                    }),
                    ...(dto.canonicalUrl !== undefined && {
                        canonicalUrl: dto.canonicalUrl,
                    }),
                    ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.price !== undefined && { price: dto.price }),
                    ...(dto.compareAtPrice !== undefined && {
                        compareAtPrice: dto.compareAtPrice,
                    }),
                    ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
                    ...(dto.sku && { sku: dto.sku }),
                    ...(dto.gender && { gender: dto.gender }),
                    ...(dto.fabric !== undefined && { fabric: dto.fabric }),
                    ...(dto.fit !== undefined && { fit: dto.fit }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
                    ...(dto.isNewArrival !== undefined && {
                        isNewArrival: dto.isNewArrival,
                    }),
                    ...(dto.isBestSeller !== undefined && {
                        isBestSeller: dto.isBestSeller,
                    }),
                    ...(dto.isExpressAvailable !== undefined && {
                        isExpressAvailable: dto.isExpressAvailable,
                    }),
                    ...(dto.fabricOrigin !== undefined && {
                        fabricOrigin: dto.fabricOrigin,
                    }),
                    ...(dto.gsm !== undefined && { gsm: dto.gsm }),
                    ...(dto.careInstructions !== undefined && {
                        careInstructions: dto.careInstructions,
                    }),
                    ...(dto.tags !== undefined && {
                        tags: normalizeProductTags(dto.tags),
                    }),
                    ...(dto.alertThreshold !== undefined && {
                        alertThreshold: dto.alertThreshold,
                    }),
                    ...(dto.shortDescription !== undefined && {
                        shortDescription: dto.shortDescription,
                    }),
                },
            });
            if (dto.images !== undefined) {
                await transaction.productImage.deleteMany({
                    where: { productId: targetId },
                });
                if (dto.images.length) {
                    await transaction.productImage.createMany({
                        data: dto.images.map((img, idx) => ({
                            productId: targetId,
                            url: img.url,
                            publicId: img.publicId,
                            altText: img.altText ?? `${dto.name || 'Product'} image ${idx + 1}`,
                            sortOrder: img.sortOrder ?? idx,
                            isPrimary: img.isPrimary ?? idx === 0,
                        })),
                    });
                }
            }
            if (dto.variants && Array.isArray(dto.variants)) {
                const incomingSkus = dto.variants.map((v) => v.sku);
                const orderVariants = await transaction.orderItem.findMany({
                    where: { productId: targetId },
                    select: { variantId: true },
                });
                const protectedVariantIds = orderVariants
                    .map((o) => o.variantId)
                    .filter((id) => Boolean(id));
                await transaction.productVariant.deleteMany({
                    where: {
                        productId: targetId,
                        sku: { notIn: incomingSkus },
                        id: { notIn: protectedVariantIds },
                    },
                });
            }
            for (const variant of dto.variants ?? []) {
                const current = await transaction.productVariant.findUnique({
                    where: { sku: variant.sku },
                    select: { id: true, productId: true, stock: true },
                });
                if (current && current.productId !== targetId) {
                    throw new ConflictException('A product variant with this SKU already exists');
                }
                if ((!current || current.stock <= 0) && (variant.stock ?? 0) > 0) {
                    wasRestocked = true;
                }
                const data = {
                    size: variant.sizeLabel
                        ? normalizeCanonicalSizeLabel(variant.sizeLabel)
                        : variant.size,
                    sizeLabel: variant.sizeLabel
                        ? normalizeCanonicalSizeLabel(variant.sizeLabel)
                        : undefined,
                    sizeType: variant.sizeType,
                    color: variant.color,
                    sku: variant.sku,
                    stock: variant.stock,
                    priceOverride: variant.priceOverride,
                    measurements: variant.measurements,
                    isActive: true,
                };
                if (current) {
                    await transaction.productVariant.update({
                        where: { id: current.id },
                        data,
                    });
                }
                else {
                    await transaction.productVariant.create({
                        data: { ...data, productId: targetId },
                    });
                }
            }
            return transaction.product.findUniqueOrThrow({
                where: { id: targetId },
                include: { category: true, variants: true, images: true },
            });
        }, {
            maxWait: 10000,
            timeout: 30000,
        });
        if (wasRestocked) {
            this.wishlistService
                ?.notifyWishlistCustomersBackInStock(targetId)
                .catch((err) => {
                this.logger.error(`Failed to send back-in-stock notifications for product ${targetId}: ${err.message}`);
            });
        }
        if (dto.images !== undefined) {
            const retainedPublicIds = new Set(dto.images
                .map((image) => image.publicId)
                .filter((value) => Boolean(value)));
            const removedPublicIds = previousImages
                .map((image) => image.publicId)
                .filter((publicId) => publicId !== null && !retainedPublicIds.has(publicId));
            const cleanupResults = await Promise.allSettled(removedPublicIds.map((publicId) => this.cloudinary.destroyProductImage(publicId)));
            const failedPublicIds = removedPublicIds.filter((_, index) => cleanupResults[index]?.status === 'rejected');
            if (failedPublicIds.length) {
                this.logger.error(`Product image cleanup failed for: ${failedPublicIds.join(', ')}`);
                return {
                    ...updatedProduct,
                    imageCleanupWarning: `Product saved, but Cloudinary cleanup failed for ${failedPublicIds.join(', ')}`,
                };
            }
        }
        return updatedProduct;
    }
    async archive(id) {
        const existing = await this.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: { id: true, name: true, isActive: true, deletedAt: true },
        });
        if (!existing) {
            throw new NotFoundException(`Product not found with identifier: ${id}`);
        }
        if (!existing.isActive && existing.deletedAt) {
            throw new BadRequestException(`Product "${existing.name}" is already archived`);
        }
        const updated = await this.prisma.product.update({
            where: { id: existing.id },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
            include: {
                category: true,
                images: true,
                variants: true,
            },
        });
        this.logger.log(`Product "${existing.name}" (${existing.id}) successfully archived.`);
        return {
            message: `Product "${existing.name}" archived successfully`,
            data: updated,
        };
    }
    async restore(id) {
        const existing = await this.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: { id: true, name: true, isActive: true, deletedAt: true },
        });
        if (!existing) {
            throw new NotFoundException(`Product not found with identifier: ${id}`);
        }
        const updated = await this.prisma.product.update({
            where: { id: existing.id },
            data: {
                isActive: true,
                deletedAt: null,
            },
            include: {
                category: true,
                images: true,
                variants: true,
            },
        });
        this.logger.log(`Product "${existing.name}" (${existing.id}) successfully restored.`);
        return {
            message: `Product "${existing.name}" restored successfully`,
            data: updated,
        };
    }
    async delete(id) {
        const existing = await this.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: {
                id: true,
                name: true,
                images: { select: { publicId: true } },
            },
        });
        if (!existing) {
            throw new NotFoundException(`Product not found with identifier: ${id}`);
        }
        const targetId = existing.id;
        const historicalOrderCount = await this.prisma.orderItem.count({
            where: { productId: targetId },
        });
        await this.prisma.$transaction(async (transaction) => {
            await transaction.orderItem.updateMany({
                where: { productId: targetId },
                data: {
                    productId: null,
                    variantId: null,
                },
            });
            await transaction.productRelation.deleteMany({
                where: {
                    OR: [{ sourceProductId: targetId }, { targetProductId: targetId }],
                },
            });
            await transaction.reviewVote.deleteMany({
                where: { review: { productId: targetId } },
            });
            await transaction.review.deleteMany({
                where: { productId: targetId },
            });
            await transaction.cartItem.deleteMany({
                where: { productId: targetId },
            });
            await transaction.wishlistItem.deleteMany({
                where: { productId: targetId },
            });
            await transaction.productImage.deleteMany({
                where: { productId: targetId },
            });
            await transaction.productVariant.deleteMany({
                where: { productId: targetId },
            });
            await transaction.product.delete({
                where: { id: targetId },
            });
        }, {
            maxWait: 10000,
            timeout: 30000,
        });
        const publicIds = existing.images
            .map((image) => image.publicId)
            .filter((publicId) => Boolean(publicId));
        let cleanupWarning;
        if (publicIds.length > 0) {
            const cleanup = await Promise.allSettled(publicIds.map((publicId) => this.cloudinary.destroyProductImage(publicId)));
            const failedPublicIds = publicIds.filter((_, index) => cleanup[index]?.status === 'rejected');
            if (failedPublicIds.length > 0) {
                this.logger.error(`Cloudinary image cleanup failed for product "${existing.name}" (${targetId}) assets: ${failedPublicIds.join(', ')}`);
                cleanupWarning = `Product permanently deleted, but Cloudinary asset cleanup failed for ${failedPublicIds.join(', ')}`;
            }
        }
        return {
            message: cleanupWarning
                ? `Product "${existing.name}" permanently deleted from database. Warning: Cloudinary cleanup failed.`
                : `Product "${existing.name}" permanently deleted from database`,
            data: {
                id: targetId,
                name: existing.name,
                historicalOrdersPreserved: historicalOrderCount,
                cleanupWarning,
            },
        };
    }
};
ProductsService = ProductsService_1 = __decorate([
    Injectable(),
    __param(2, Optional()),
    __metadata("design:paramtypes", [PrismaService,
        CloudinaryService,
        WishlistService])
], ProductsService);
export { ProductsService };
function isUniqueConstraintError(error) {
    return (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002');
}
function buildProductWhere(query, isAdmin, excludedFacet) {
    const where = {};
    const andConditions = [];
    if (!isAdmin) {
        where.isActive = true;
        where.deletedAt = null;
        where.category = { is: { isActive: true } };
    }
    if (query.search) {
        const searchText = query.search.trim().toLowerCase();
        const searchTerms = searchText.split(/\s+/).filter(Boolean);
        const tagSearchTerms = [
            ...new Set([...searchTerms, searchTerms.join('-')]),
        ];
        andConditions.push({
            OR: [
                { name: { contains: query.search.trim(), mode: 'insensitive' } },
                { sku: { contains: query.search.trim(), mode: 'insensitive' } },
                { description: { contains: query.search.trim(), mode: 'insensitive' } },
                { tags: { hasSome: tagSearchTerms } },
            ],
        });
    }
    if (query.category && excludedFacet !== 'category') {
        where.category = {
            is: {
                ...(isAdmin ? {} : { isActive: true }),
                OR: [
                    { slug: { equals: query.category, mode: 'insensitive' } },
                    { name: { equals: query.category, mode: 'insensitive' } },
                ],
            },
        };
    }
    if (query.collection) {
        if (query.collection.toLowerCase() === 'bestsellers') {
            andConditions.push({
                OR: [
                    { isBestSeller: true },
                    {
                        orderItems: {
                            some: {
                                order: { status: { not: 'CANCELLED' } },
                            },
                        },
                    },
                    {
                        collections: {
                            some: {
                                ...(isAdmin ? {} : { isActive: true }),
                                OR: [
                                    { slug: { equals: query.collection, mode: 'insensitive' } },
                                    { name: { equals: query.collection, mode: 'insensitive' } },
                                ],
                            },
                        },
                    },
                ],
            });
        }
        else {
            where.collections = {
                some: {
                    ...(isAdmin ? {} : { isActive: true }),
                    OR: [
                        { slug: { equals: query.collection, mode: 'insensitive' } },
                        { name: { equals: query.collection, mode: 'insensitive' } },
                    ],
                },
            };
        }
    }
    if (query.gender)
        where.gender = query.gender;
    if (query.featured !== undefined)
        where.isFeatured = query.featured;
    if (query.newArrival !== undefined)
        where.isNewArrival = query.newArrival;
    if (query.bestSeller !== undefined) {
        if (query.bestSeller) {
            andConditions.push({
                OR: [
                    { isBestSeller: true },
                    {
                        orderItems: {
                            some: {
                                order: { status: { not: 'CANCELLED' } },
                            },
                        },
                    },
                ],
            });
        }
        else {
            where.isBestSeller = false;
            where.orderItems = {
                none: {
                    order: { status: { not: 'CANCELLED' } },
                },
            };
        }
    }
    if (query.onSale)
        where.compareAtPrice = { not: null };
    if (query.expressAvailable !== undefined)
        where.isExpressAvailable = query.expressAvailable;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.price = {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
        };
    }
    if (query.fabric?.length && excludedFacet !== 'fabric') {
        andConditions.push({
            OR: query.fabric.map((fabric) => ({
                fabric: { contains: fabric, mode: 'insensitive' },
            })),
        });
    }
    if (query.fabricOrigin?.length && excludedFacet !== 'fabricOrigin') {
        andConditions.push({
            OR: query.fabricOrigin.map((fabricOrigin) => ({
                fabricOrigin: { contains: fabricOrigin, mode: 'insensitive' },
            })),
        });
    }
    if (query.fit?.length && excludedFacet !== 'fit') {
        andConditions.push({
            OR: query.fit.map((fit) => ({
                fit: { contains: fit, mode: 'insensitive' },
            })),
        });
    }
    if (query.status === 'Active') {
        where.isActive = true;
        where.deletedAt = null;
    }
    else if (query.status === 'Archived') {
        where.OR = [{ isActive: false }, { deletedAt: { not: null } }];
    }
    else if (query.status === 'Out of Stock') {
        where.isActive = true;
        where.deletedAt = null;
        where.variants = { none: { isActive: true, stock: { gt: 0 } } };
    }
    else if (query.status === 'Low Stock') {
        where.isActive = true;
        where.deletedAt = null;
        where.variants = { some: { isActive: true, stock: { gt: 0, lte: 5 } } };
    }
    else {
        const sizes = excludedFacet === 'size' ? undefined : query.size;
        const colors = excludedFacet === 'color' ? undefined : query.color;
        if (sizes?.length || colors?.length || query.inStock !== undefined) {
            const variantWhere = { isActive: true };
            if (sizes?.length) {
                const sizeSearchLabels = sizes.flatMap((size) => /^\d+(?:\.\d+)?$/.test(size) ? [size, `${size}"`, `${size}″`] : [size]);
                const alphabeticLabels = sizeSearchLabels.filter((size) => !/^\d+(?:\.\d+)?(?:\s*["″])?$/.test(size));
                const numericLabels = sizeSearchLabels.filter((size) => /^\d+(?:\.\d+)?(?:\s*["″])?$/.test(size));
                const sizeConditions = [];
                if (alphabeticLabels.length) {
                    sizeConditions.push({
                        sizeLabel: { in: alphabeticLabels, mode: 'insensitive' },
                    });
                    sizeConditions.push({
                        AND: [
                            { sizeLabel: null },
                            { size: { in: alphabeticLabels, mode: 'insensitive' } },
                        ],
                    });
                }
                if (numericLabels.length) {
                    const waistSizeCondition = {
                        OR: [
                            { sizeType: 'WAIST' },
                            {
                                product: {
                                    category: {
                                        slug: { contains: 'trouser', mode: 'insensitive' },
                                    },
                                },
                            },
                            {
                                product: {
                                    category: {
                                        slug: { contains: 'pant', mode: 'insensitive' },
                                    },
                                },
                            },
                        ],
                    };
                    sizeConditions.push({
                        AND: [
                            { sizeLabel: { in: numericLabels, mode: 'insensitive' } },
                            waistSizeCondition,
                        ],
                    });
                    sizeConditions.push({
                        AND: [
                            { sizeLabel: null },
                            { size: { in: numericLabels, mode: 'insensitive' } },
                            waistSizeCondition,
                        ],
                    });
                }
                variantWhere.OR = sizeConditions;
            }
            if (colors?.length) {
                variantWhere.color = { in: colors, mode: 'insensitive' };
            }
            if (query.inStock === true)
                variantWhere.stock = { gt: 0 };
            where.variants =
                query.inStock === false
                    ? { none: { isActive: true, stock: { gt: 0 } } }
                    : { some: variantWhere };
        }
    }
    if (andConditions.length)
        where.AND = andConditions;
    return where;
}
function normalizeProductTags(tags) {
    return [
        ...new Set((tags ?? [])
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean)),
    ];
}
function toSlug(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
const apparelSizeLabels = new Set([
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    '4XL',
    '5XL',
]);
function normalizeStorefrontSizeLabels(product) {
    const reviews = product.reviews ?? [];
    const reviewsCount = reviews.length;
    const averageRating = reviewsCount > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
        : 0;
    const totalSold = (product.orderItems ?? []).reduce((sum, oi) => sum + (oi.quantity || 1), 0);
    const isBestSeller = Boolean(product.isBestSeller || totalSold > 0);
    const base = {
        ...product,
        reviewsCount,
        averageRating,
        totalSold,
        isBestSeller,
    };
    if (!product.category || !product.variants)
        return base;
    const category = { slug: product.category.slug };
    return {
        ...base,
        variants: product.variants.map((variant) => ({
            ...variant,
            sizeLabel: getShopSizeLabel({ ...variant, product: { category } }) ?? null,
        })),
    };
}
function normalizeCanonicalSizeLabel(value) {
    const normalized = value.trim().replace(/\s+/g, ' ');
    const upperLabel = normalized.toUpperCase();
    return apparelSizeLabels.has(upperLabel) ? upperLabel : normalized;
}
function getShopSizeLabel(variant) {
    const rawLabel = (variant.sizeLabel || variant.size).trim().replace(/\s+/g, ' ');
    if (!rawLabel)
        return undefined;
    const upperLabel = rawLabel.toUpperCase();
    const canonicalLabel = apparelSizeLabels.has(upperLabel) ? upperLabel : rawLabel;
    const isNumeric = /^\d+(?:\.\d+)?(?:\s*["″])?$/.test(rawLabel);
    const numericLabel = rawLabel.replace(/\s*["″]$/, '');
    const isTrouser = /trouser|pant/.test(variant.product.category.slug.toLowerCase());
    if (variant.sizeType === 'APPAREL') {
        return isNumeric || upperLabel === 'STANDARD' ? undefined : canonicalLabel;
    }
    if (variant.sizeType === 'WAIST') {
        return isNumeric ? numericLabel : undefined;
    }
    if (variant.sizeType === 'CUSTOM') {
        return isNumeric || upperLabel === 'STANDARD' ? undefined : canonicalLabel;
    }
    if (apparelSizeLabels.has(upperLabel))
        return upperLabel;
    if (isNumeric && isTrouser)
        return numericLabel;
    if (isNumeric || upperLabel === 'STANDARD')
        return undefined;
    return canonicalLabel;
}
function getShopSizeType(variant, label) {
    if (variant.sizeType === 'APPAREL' ||
        variant.sizeType === 'WAIST' ||
        variant.sizeType === 'CUSTOM') {
        return variant.sizeType;
    }
    if (apparelSizeLabels.has(label.toUpperCase()))
        return 'APPAREL';
    if (/^\d+(?:\.\d+)?$/.test(label) &&
        /trouser|pant/.test(variant.product.category.slug.toLowerCase())) {
        return 'WAIST';
    }
    return 'CUSTOM';
}
//# sourceMappingURL=products.service.js.map