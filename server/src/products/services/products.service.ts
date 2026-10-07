import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto, isAdmin = false): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (!isAdmin) where.isActive = true;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) {
      where.category = {
        OR: [
          { slug: { equals: query.category, mode: 'insensitive' } },
          { name: { equals: query.category, mode: 'insensitive' } },
        ],
      };
    }
    if (query.gender) where.gender = query.gender;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.newArrival !== undefined) where.isNewArrival = query.newArrival;
    if (query.bestSeller !== undefined) where.isBestSeller = query.bestSeller;
    if (query.expressAvailable !== undefined) where.isExpressAvailable = query.expressAvailable;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.fabric) where.fabric = { contains: query.fabric, mode: 'insensitive' };
    if (query.fit) where.fit = { contains: query.fit, mode: 'insensitive' };
    if (query.size?.length || query.color?.length || query.inStock !== undefined) {
      const variantWhere: Prisma.ProductVariantWhereInput = { isActive: true };
      if (query.size?.length) {
        variantWhere.OR = [
          { size: { in: query.size, mode: 'insensitive' } },
          { sizeLabel: { in: query.size, mode: 'insensitive' } },
        ];
      }
      if (query.color?.length) {
        variantWhere.color = { in: query.color, mode: 'insensitive' };
      }
      if (query.inStock === true) variantWhere.stock = { gt: 0 };
      where.variants = query.inStock === false
        ? { none: { isActive: true, stock: { gt: 0 } } }
        : { some: variantWhere };
    }
    if (query.status === 'Active') where.isActive = true;
    if (query.status === 'Out of Stock') where.variants = { none: { isActive: true, stock: { gt: 0 } } };
    if (query.status === 'Low Stock') where.variants = { some: { isActive: true, stock: { gt: 0, lte: 5 } } };

    const orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] =
      query.sort === 'price-asc'
        ? { price: 'asc' }
        : query.sort === 'price-desc'
          ? { price: 'desc' }
          : query.sort === 'best-selling'
            ? [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }]
          : query.sort === 'featured'
            ? { isFeatured: 'desc' }
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
              color: true,
              sku: true,
              stock: true,
              isActive: true,
              priceOverride: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ slug }, { id: slug }], isActive: true },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: { where: { isActive: true } },
        reviews: {
          where: { status: 'APPROVED' },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new NotFoundException(`Garment not found with slug or ID: ${slug}`);
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      },
    });
    if (!product) throw new NotFoundException(`Garment not found with identifier: ${id}`);
    return product;
  }

  async findRelated(slug: string, relationType: 'RELATED' | 'COMPLEMENTARY') {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true, categoryId: true },
    });
    if (!product) throw new NotFoundException(`Garment not found with slug: ${slug}`);
    const relations = await this.prisma.productRelation.findMany({
      where: {
        sourceProductId: product.id,
        relationType,
        targetProduct: { isActive: true },
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
      select: {
        targetProduct: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            variants: { where: { isActive: true } },
          },
        },
      },
    });
    if (relations.length) return relations.map((relation) => relation.targetProduct);
    return this.prisma.product.findMany({
      where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: { where: { isActive: true } },
      },
    });
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const existing = await this.prisma.product.findFirst({
        where: { OR: [{ slug }, { sku: dto.sku }] },
      });
      if (existing) {
        throw new ConflictException('A product with this SKU or slug already exists in the catalog');
      }

      return await this.prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          costPrice: dto.costPrice,
          sku: dto.sku,
          gender: dto.gender || 'MEN',
          fabric: dto.fabric,
          fit: dto.fit,
          isActive: dto.isActive ?? true,
          isFeatured: dto.isFeatured ?? false,
          isNewArrival: dto.isNewArrival ?? true,
          isBestSeller: dto.isBestSeller ?? false,
          categoryId: dto.categoryId,
          variants: dto.variants?.length
            ? {
                create: dto.variants.map((v) => ({
                  size: v.size,
                  sizeLabel: v.sizeLabel,
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
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      if (isUniqueConstraintError(err)) {
        throw new ConflictException('A product with this SKU or slug already exists in the catalog');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException(`Garment not found: ${id}`);
    const targetId = existing.id;

    return this.prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id: targetId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.slug && { slug: dto.slug }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
          ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
          ...(dto.sku && { sku: dto.sku }),
          ...(dto.gender && { gender: dto.gender }),
          ...(dto.fabric !== undefined && { fabric: dto.fabric }),
          ...(dto.fit !== undefined && { fit: dto.fit }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
          ...(dto.isBestSeller !== undefined && { isBestSeller: dto.isBestSeller }),
          ...(dto.isExpressAvailable !== undefined && { isExpressAvailable: dto.isExpressAvailable }),
          ...(dto.fabricOrigin !== undefined && { fabricOrigin: dto.fabricOrigin }),
          ...(dto.gsm !== undefined && { gsm: dto.gsm }),
          ...(dto.careInstructions !== undefined && { careInstructions: dto.careInstructions }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
        },
      });

      if (dto.images !== undefined) {
        await transaction.productImage.deleteMany({ where: { productId: targetId } });
        if (dto.images.length) {
          await transaction.productImage.createMany({
            data: dto.images.map((img, idx) => ({
              productId: targetId,
              url: img.url,
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
        const protectedVariantIds = orderVariants.map((o) => o.variantId);

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
          select: { id: true, productId: true },
        });
        if (current && current.productId !== targetId) {
          throw new ConflictException('A product variant with this SKU already exists');
        }
        const data = {
          size: variant.size,
          sizeLabel: variant.sizeLabel,
          color: variant.color,
          sku: variant.sku,
          stock: variant.stock,
          priceOverride: variant.priceOverride,
          measurements: variant.measurements,
          isActive: true,
        };
        if (current) {
          await transaction.productVariant.update({ where: { id: current.id }, data });
        } else {
          await transaction.productVariant.create({ data: { ...data, productId: targetId } });
        }
      }

      return transaction.product.findUniqueOrThrow({
        where: { id: targetId },
        include: { category: true, variants: true, images: true },
      });
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, name: true, sku: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product not found with identifier: ${id}`);
    }

    const targetId = existing.id;

    // Permanently remove product and all foreign key relationships from database
    await this.prisma.productRelation.deleteMany({
      where: { OR: [{ sourceProductId: targetId }, { targetProductId: targetId }] },
    });
    await this.prisma.reviewVote.deleteMany({
      where: { review: { productId: targetId } },
    });
    await this.prisma.review.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.cartItem.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.wishlistItem.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.productImage.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.orderItem.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.productVariant.deleteMany({
      where: { productId: targetId },
    });
    await this.prisma.product.delete({
      where: { id: targetId },
    });

    return { message: `Product "${existing.name}" permanently deleted from database` };
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
