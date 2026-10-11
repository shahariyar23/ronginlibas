import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CollectionsService implements OnModuleInit {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultsIfEmpty().catch((err) => {
      this.logger.warn(`Failed auto-seeding collections: ${err.message}`);
    });
  }

  async findAll(isAdmin = false) {
    const where = isAdmin ? {} : { isActive: true };
    return this.prisma.collection.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            products: isAdmin ? true : { where: { isActive: true, deletedAt: null } },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            isActive: true,
            images: {
              take: 1,
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              select: { url: true, altText: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID "${id}" was not found.`);
    }

    return collection;
  }

  async findBySlug(slug: string, isAdmin = false) {
    const where = isAdmin
      ? { slug }
      : { slug, isActive: true };

    const collection = await this.prisma.collection.findFirst({
      where,
      include: {
        products: {
          where: isAdmin ? { deletedAt: null } : { isActive: true, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: true,
            gender: true,
            category: { select: { name: true, slug: true } },
            images: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              select: { id: true, url: true, altText: true, isPrimary: true },
            },
            variants: {
              where: { isActive: true },
              select: { id: true, size: true, color: true, stock: true },
            },
          },
        },
        _count: {
          select: {
            products: isAdmin ? true : { where: { isActive: true, deletedAt: null } },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with slug "${slug}" was not found.`);
    }

    if (slug === 'bestsellers' && collection.products.length === 0) {
      const dynamicProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { isBestSeller: true },
            { orderItems: { some: { order: { status: { not: 'CANCELLED' } } } } },
          ],
        },
        orderBy: [
          { orderItems: { _count: 'desc' } },
          { isBestSeller: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          compareAtPrice: true,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          gender: true,
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            select: { id: true, url: true, altText: true, isPrimary: true },
          },
          variants: {
            where: { isActive: true },
            select: { id: true, size: true, color: true, stock: true },
          },
        },
      });

      return {
        ...collection,
        products: dynamicProducts,
        _count: { products: dynamicProducts.length },
      };
    }

    return collection;
  }

  async create(dto: CreateCollectionDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);

    const existing = await this.prisma.collection.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`A collection with slug "${slug}" already exists.`);
    }

    const { productIds, ...rest } = dto;

    return this.prisma.collection.create({
      data: {
        ...rest,
        slug,
        products: productIds && productIds.length > 0
          ? {
              connect: productIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException(`Collection with ID "${id}" was not found.`);
    }

    let finalSlug: string | undefined = undefined;
    if (dto.slug && dto.slug !== existing.slug) {
      finalSlug = slugify(dto.slug);
      const duplicate = await this.prisma.collection.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`A collection with slug "${finalSlug}" already exists.`);
      }
    }

    const { productIds, ...rest } = dto;

    return this.prisma.collection.update({
      where: { id },
      data: {
        ...rest,
        ...(finalSlug ? { slug: finalSlug } : {}),
        products: productIds !== undefined
          ? {
              set: productIds.map((pid) => ({ id: pid })),
            }
          : undefined,
      },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, offers: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Collection with ID "${id}" was not found.`);
    }

    // Safely disconnect products before removing
    await this.prisma.collection.update({
      where: { id },
      data: {
        products: { set: [] },
        offers: { set: [] },
      },
    });

    return this.prisma.collection.delete({
      where: { id },
    });
  }

  private async seedDefaultsIfEmpty() {
    const count = await this.prisma.collection.count();
    if (count > 0) return;

    this.logger.log('Seeding initial baseline product collections...');

    const defaults: Array<{
      name: string;
      slug: string;
      tagline: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
      seoTitle: string;
      metaDescription: string;
      filterCondition: Prisma.ProductWhereInput;
    }> = [
      {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        tagline: 'FRESH OFF THE LOOM',
        description:
          'The latest artisanal releases from the Rongin Libas atelier. Limited seasonal drops, hand-embroidered panjabis, and mercerized knitwear.',
        isActive: true,
        sortOrder: 1,
        seoTitle: 'New Arrivals | Rongin Libas — Fresh Off The Loom',
        metaDescription: 'Shop the newest luxury menswear releases and festive arrivals.',
        filterCondition: { isNewArrival: true },
      },
      {
        name: 'Best Sellers',
        slug: 'bestsellers',
        tagline: 'TIMELESS DISTINCTION',
        description:
          'The definitive garments celebrated by discerning patrons across Bangladesh. Hand-selected for impeccable drape, fit, and ancestral quality.',
        isActive: true,
        sortOrder: 2,
        seoTitle: 'Best Sellers | Rongin Libas — Timeless Distinction',
        metaDescription: 'Discover our most celebrated panjabis, kurtas, and luxury ensembles.',
        filterCondition: {
          OR: [
            { isBestSeller: true },
            { orderItems: { some: { order: { status: { not: 'CANCELLED' } } } } },
          ],
        },
      },
      {
        name: 'Featured Collection',
        slug: 'featured',
        tagline: 'CURATED DISTINCTION',
        description:
          'Masterpieces of Bengal sartorial tradition featuring royal emerald accents, mercerized textures, and bespoke silhouettes.',
        isActive: true,
        sortOrder: 3,
        seoTitle: 'Featured Collection | Rongin Libas — Curated Distinction',
        metaDescription: 'Masterpieces of Bengal craftsmanship and royal sartorial heritage.',
        filterCondition: { isFeatured: true },
      },
      {
        name: 'Atelier Essentials',
        slug: 'essential',
        tagline: 'FOUNDATION WARDROBE',
        description:
          'Essential wardrobe staples designed for understated elegance, daily luxury, and lasting comfort.',
        isActive: true,
        sortOrder: 4,
        seoTitle: 'Atelier Essentials | Rongin Libas — Foundation Wardrobe',
        metaDescription: 'Essential wardrobe staples designed for everyday distinction.',
        filterCondition: {},
      },
    ];

    for (const def of defaults) {
      const { filterCondition, ...colData } = def;
      const matchingProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          ...filterCondition,
        },
        take: 12,
        select: { id: true },
      });

      await this.prisma.collection.create({
        data: {
          ...colData,
          products: {
            connect: matchingProducts.map((p) => ({ id: p.id })),
          },
        },
      });
    }

    this.logger.log('Baseline product collections successfully created and linked.');
  }
}
