import { vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

describe('ProductsService storefront catalogue', () => {
  it('stores the canonical variant label separately from configured measurements', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'product-id' });
    const prisma = {
      product: {
        findFirst: vi.fn().mockResolvedValue(null),
        create,
      },
    } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    await service.create({
      name: 'Tailored Shirt',
      sku: 'RL-SHR-001',
      price: 2400,
      categoryId: 'shirts',
      variants: [
        {
          size: '40',
          sizeLabel: ' l ',
          sizeType: 'APPAREL',
          color: 'Forest',
          sku: 'RL-SHR-FOREST-L',
          stock: 3,
          measurements: { chest: 40, unit: 'IN' },
        },
      ],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          variants: {
            create: [
              expect.objectContaining({
                size: 'L',
                sizeLabel: 'L',
                sizeType: 'APPAREL',
                measurements: { chest: 40, unit: 'IN' },
              }),
            ],
          },
        }),
      }),
    );
  });

  it('orders best sellers by order-item count and excludes inactive variants', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { product: { findMany, count } } as unknown as PrismaService;
    const cloudinary = { destroyProductImage: vi.fn() } as unknown as CloudinaryService;
    const service = new ProductsService(prisma, cloudinary);

    await service.findAll({ page: 1, limit: 8, sort: 'best-selling' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, category: { is: { isActive: true } } },
        orderBy: [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }],
        include: expect.objectContaining({
          variants: expect.objectContaining({ where: { isActive: true } }),
        }),
      }),
    );
  });

  it('finds related products when the storefront passes a product ID', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 'product-id', categoryId: 'category-id' });
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      product: { findFirst, findMany },
      productRelation: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    await service.findRelated('product-id', 'RELATED');

    expect(findFirst).toHaveBeenCalledWith({
      where: { OR: [{ slug: 'product-id' }, { id: 'product-id' }], isActive: true },
      select: { id: true, categoryId: true },
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, categoryId: 'category-id', id: { not: 'product-id' } },
      }),
    );
  });

  it('combines catalogue filters in the database query', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { product: { findMany, count } } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    await service.findAll({
      page: 1,
      limit: 12,
      category: 'panjabi',
      size: ['M', 'L'],
      color: ['Forest'],
      fabric: ['Raw Silk'],
      fabricOrigin: ['Bangladesh'],
      fit: ['Regular'],
      minPrice: 1000,
      maxPrice: 5000,
      inStock: true,
      search: 'heritage',
      sort: 'price-asc',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          category: {
            is: {
              isActive: true,
              OR: [
                { slug: { equals: 'panjabi', mode: 'insensitive' } },
                { name: { equals: 'panjabi', mode: 'insensitive' } },
              ],
            },
          },
          AND: expect.arrayContaining([
            {
              OR: [
                { name: { contains: 'heritage', mode: 'insensitive' } },
                { sku: { contains: 'heritage', mode: 'insensitive' } },
                { description: { contains: 'heritage', mode: 'insensitive' } },
              ],
            },
            {
              OR: [{ fabric: { contains: 'Raw Silk', mode: 'insensitive' } }],
            },
            {
              OR: [{ fabricOrigin: { contains: 'Bangladesh', mode: 'insensitive' } }],
            },
            {
              OR: [{ fit: { contains: 'Regular', mode: 'insensitive' } }],
            },
          ]),
          price: { gte: 1000, lte: 5000 },
          variants: {
            some: {
              isActive: true,
              OR: [
                { sizeLabel: { in: ['M', 'L'], mode: 'insensitive' } },
                {
                  AND: [
                    { sizeLabel: null },
                    { size: { in: ['M', 'L'], mode: 'insensitive' } },
                  ],
                },
              ],
              color: { in: ['Forest'], mode: 'insensitive' },
              stock: { gt: 0 },
            },
          },
        }),
        skip: 0,
        take: 12,
        orderBy: { price: 'asc' },
      }),
    );
  });

  it('restricts legacy numeric size filters to waist-size variants and trouser products', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { product: { findMany, count } } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    await service.findAll({ size: ['34'], page: 1, limit: 12 });

    const variantWhere = findMany.mock.calls[0][0].where.variants.some;
    expect(variantWhere.OR[0]).toEqual({
      AND: [
        { sizeLabel: { in: ['34', '34"', '34″'], mode: 'insensitive' } },
        {
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
        },
      ],
    });
  });

  it('rejects invalid price ranges', async () => {
    const prisma = { product: { findMany: vi.fn(), count: vi.fn() } } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    await expect(service.findAll({ minPrice: 5000, maxPrice: 1000 })).rejects.toThrow(
      'minPrice cannot be greater than maxPrice',
    );
  });

  it('builds filter options from active category, product, and variant data', async () => {
    const sizeVariants = Array.from({ length: 4 }, () => ({
      size: 'M',
      sizeLabel: 'M',
      sizeType: 'APPAREL',
      product: { category: { slug: 'panjabi' } },
    }));
    const groupBy = vi.fn(({ by }: { by: string[] }) => {
      if (by[0] === 'color') {
        return Promise.resolve([{ color: 'Forest', _count: { _all: 3 } }]);
      }
      if (by[0] === 'fabric') {
        return Promise.resolve([{ fabric: 'Raw Silk', _count: { _all: 2 } }]);
      }
      if (by[0] === 'fabricOrigin') {
        return Promise.resolve([{ fabricOrigin: 'Bangladesh', _count: { _all: 2 } }]);
      }
      return Promise.resolve([{ fit: 'Regular', _count: { _all: 1 } }]);
    });
    const prisma = {
      category: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'category-id', name: 'Panjabi', slug: 'panjabi', _count: { products: 2 } },
        ]),
      },
      productVariant: {
        groupBy,
        findMany: vi.fn().mockResolvedValue(sizeVariants),
      },
      product: {
        groupBy,
        aggregate: vi.fn().mockResolvedValue({
          _min: { price: 850 },
          _max: { price: 8500 },
        }),
      },
    } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
    );

    const result = await service.getFilters({});

    expect(result).toEqual({
      categories: [{ id: 'category-id', name: 'Panjabi', slug: 'panjabi', count: 2 }],
      sizes: [{ value: 'M', type: 'APPAREL', count: 4 }],
      colors: [{ name: 'Forest', slug: 'forest', count: 3 }],
      fabrics: [{ name: 'Raw Silk', slug: 'raw-silk', count: 2 }],
      fabricOrigins: [{ name: 'Bangladesh', slug: 'bangladesh', count: 2 }],
      fits: [{ name: 'Regular', slug: 'regular', count: 1 }],
      price: { min: 850, max: 8500 },
    });
  });

  it('normalizes apparel size labels and omits ambiguous legacy upper-body measurements', async () => {
      const groupBy = vi.fn(({ by }: { by: string[] }) =>
        Promise.resolve(
          by[0] === 'color'
            ? []
            : by[0] === 'fabric'
              ? []
              : by[0] === 'fabricOrigin'
                ? []
                : [{ fit: 'Regular', _count: { _all: 0 } }],
        ),
      );
      const prisma = {
        category: { findMany: vi.fn().mockResolvedValue([]) },
        productVariant: {
          groupBy,
          findMany: vi.fn().mockResolvedValue([
            {
              size: 'l',
              sizeLabel: ' l ',
              sizeType: 'APPAREL',
              product: { category: { slug: 'panjabi' } },
            },
            {
              size: '40',
              sizeLabel: null,
              sizeType: null,
              product: { category: { slug: 'panjabi' } },
            },
            {
              size: '34"',
              sizeLabel: null,
              sizeType: null,
              product: { category: { slug: 'trousers' } },
            },
          ]),
        },
        product: {
          groupBy,
          aggregate: vi.fn().mockResolvedValue({
            _min: { price: 1 },
            _max: { price: 2 },
          }),
        },
      } as unknown as PrismaService;
      const service = new ProductsService(
        prisma,
        { destroyProductImage: vi.fn() } as unknown as CloudinaryService,
      );

      const result = await service.getFilters({});

    expect(result.sizes).toEqual([
      { value: 'L', type: 'APPAREL', count: 1 },
      { value: '34', type: 'WAIST', count: 1 },
    ]);
  });

  it('does not return inactive products from public detail lookup', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'product-id',
      category: { slug: 'panjabi' },
      variants: [
        { size: 'l', sizeLabel: null, sizeType: null },
        { size: '40', sizeLabel: null, sizeType: null },
      ],
    });
    const prisma = { product: { findFirst } } as unknown as PrismaService;
    const cloudinary = { destroyProductImage: vi.fn() } as unknown as CloudinaryService;
    const service = new ProductsService(prisma, cloudinary);

    const product = await service.findBySlug('hidden-product');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ slug: 'hidden-product' }, { id: 'hidden-product' }], isActive: true },
      }),
    );
    expect(product.variants?.map((variant) => variant.sizeLabel)).toEqual(['L', null]);
  });

  it('keeps retained Cloudinary images and destroys only removed assets after update', async () => {
    const destroyProductImage = vi.fn().mockResolvedValue(undefined);
    const transaction = {
      product: {
        update: vi.fn().mockResolvedValue({ id: 'product-id' }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'product-id' }),
      },
      productImage: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prisma = {
      product: { findFirst: vi.fn().mockResolvedValue({ id: 'product-id' }) },
      productImage: {
        findMany: vi.fn().mockResolvedValue([
          { publicId: 'rongin-libas/products/keep' },
          { publicId: 'rongin-libas/products/remove' },
        ]),
      },
      $transaction: vi.fn((callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const cloudinary = { destroyProductImage } as unknown as CloudinaryService;
    const service = new ProductsService(prisma, cloudinary);

    await service.update('product-id', {
      images: [
        { url: 'https://cdn.example/keep.jpg', publicId: 'rongin-libas/products/keep' },
        { url: 'https://cdn.example/new.jpg', publicId: 'rongin-libas/products/new' },
      ],
    } as UpdateProductDto);

    expect(transaction.productImage.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          url: 'https://cdn.example/keep.jpg',
          publicId: 'rongin-libas/products/keep',
        }),
      ]),
    });
    expect(destroyProductImage).toHaveBeenCalledTimes(1);
    expect(destroyProductImage).toHaveBeenCalledWith('rongin-libas/products/remove');
  });

  it('destroys all stored Cloudinary images after deleting a product', async () => {
    const destroyProductImage = vi.fn().mockResolvedValue(undefined);
    const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
    const transaction = {
      productRelation: { deleteMany },
      reviewVote: { deleteMany },
      review: { deleteMany },
      cartItem: { deleteMany },
      wishlistItem: { deleteMany },
      productImage: { deleteMany },
      orderItem: { deleteMany },
      productVariant: { deleteMany },
      product: { delete: vi.fn().mockResolvedValue({ id: 'product-id' }) },
    };
    const prisma = {
      product: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'product-id',
          name: 'Panjabi',
          images: [{ publicId: 'rongin-libas/products/front' }],
        }),
      },
      $transaction: vi.fn((callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const service = new ProductsService(
      prisma,
      { destroyProductImage } as unknown as CloudinaryService,
    );

    await service.delete('product-id');

    expect(destroyProductImage).toHaveBeenCalledWith('rongin-libas/products/front');
    expect(transaction.product.delete).toHaveBeenCalledWith({
      where: { id: 'product-id' },
    });
  });
});
