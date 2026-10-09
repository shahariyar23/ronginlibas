import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { ProductsService } from './products.service.js';

describe('Product Archive and Permanent Delete System', () => {
  let prisma: any;
  let cloudinary: any;
  let service: ProductsService;

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      productVariant: {
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      productImage: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      productRelation: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      orderItem: {
        count: vi.fn().mockResolvedValue(0),
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      wishlist: {
        deleteMany: vi.fn(),
      },
      wishlistItem: {
        deleteMany: vi.fn(),
      },
      review: {
        deleteMany: vi.fn(),
      },
      reviewVote: {
        deleteMany: vi.fn(),
      },
      inventoryItem: {
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prisma);
        }
        return Promise.all(cb);
      }),
    };

    cloudinary = {
      destroyProductImage: vi.fn().mockResolvedValue({ result: 'ok' }),
    };

    service = new ProductsService(
      prisma as unknown as PrismaService,
      cloudinary as unknown as CloudinaryService,
    );
  });

  describe('TEST 1: Archive active product', () => {
    it('sets isActive to false and deletedAt to timestamp, keeping variants, inventory, and Cloudinary media', async () => {
      const activeProduct = {
        id: 'prod-001',
        name: 'Crimson Panjabi',
        isActive: true,
        deletedAt: null,
      };

      prisma.product.findFirst.mockResolvedValue(activeProduct);
      prisma.product.update.mockResolvedValue({
        ...activeProduct,
        isActive: false,
        deletedAt: new Date(),
      });

      const result = await service.archive('prod-001');

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-001' },
          data: expect.objectContaining({
            isActive: false,
            deletedAt: expect.any(Date),
          }),
        }),
      );

      // Cloudinary images must NOT be destroyed when archiving
      expect(cloudinary.destroyProductImage).not.toHaveBeenCalled();
      expect(result.data.isActive).toBe(false);
      expect(result.data.deletedAt).toBeDefined();
    });
  });

  describe('TEST 2: Customer product queries exclude archived products', () => {
    it('findAll excludes archived products for customer storefront', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            deletedAt: null,
          }),
        }),
      );
    });

    it('findBySlug throws NotFoundException if product is archived', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findBySlug('crimson-panjabi')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { slug: 'crimson-panjabi' },
              { id: 'crimson-panjabi' },
            ],
            isActive: true,
            deletedAt: null,
          },
        }),
      );
    });

    it('findRelated throws NotFoundException if source product is archived', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findRelated('archived-slug', 'RELATED')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ slug: 'archived-slug' }, { id: 'archived-slug' }],
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, categoryId: true },
      });
    });
  });

  describe('TEST 3: Permanent delete product without orders', () => {
    it('deletes product, variants, media and purges Cloudinary assets by publicId', async () => {
      const productToDelete = {
        id: 'prod-free',
        name: 'Summer Kurti',
        images: [
          { id: 'img-1', publicId: 'rongin/prod-free-front', url: 'https://...' },
          { id: 'img-2', publicId: 'rongin/prod-free-back', url: 'https://...' },
        ],
      };

      prisma.product.findFirst.mockResolvedValue(productToDelete);

      const result = await service.delete('prod-free');

      // Product deleted inside transaction
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-free' },
      });

      // Cloudinary images destroyed with exact publicIds
      expect(cloudinary.destroyProductImage).toHaveBeenCalledWith('rongin/prod-free-front');
      expect(cloudinary.destroyProductImage).toHaveBeenCalledWith('rongin/prod-free-back');

      expect(result.data).toEqual(
        expect.objectContaining({
          id: 'prod-free',
          name: 'Summer Kurti',
          historicalOrdersPreserved: 0,
        }),
      );
    });
  });

  describe('TEST 4: Permanent delete product that has old orders', () => {
    it('preserves historical OrderItems by setting foreign keys to null and NEVER deletes OrderItems', async () => {
      const productWithOrders = {
        id: 'prod-ordered',
        name: 'Vintage Silk Saree',
        images: [{ id: 'img-1', publicId: 'rongin/saree-1' }],
      };

      prisma.product.findFirst.mockResolvedValue(productWithOrders);

      await service.delete('prod-ordered');

      // Crucial: orderItem.updateMany is called to nullify foreign keys
      expect(prisma.orderItem.updateMany).toHaveBeenCalledWith({
        where: { productId: 'prod-ordered' },
        data: { productId: null, variantId: null },
      });

      // Crucial: orderItem.deleteMany MUST NEVER be called
      expect(prisma.orderItem.deleteMany).not.toHaveBeenCalled();

      // Product deleted cleanly
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-ordered' },
      });
    });
  });

  describe('TEST 5: Cloudinary deletion failure handling', () => {
    it('logs warning and reports Cloudinary errors without rolling back database deletion', async () => {
      const product = {
        id: 'prod-fail-media',
        name: 'Silk Dupatta',
        images: [{ id: 'img-bad', publicId: 'rongin/bad-media' }],
      };

      prisma.product.findFirst.mockResolvedValue(product);
      cloudinary.destroyProductImage.mockRejectedValue(
        new Error('Cloudinary API Timeout 504'),
      );

      const result = await service.delete('prod-fail-media');

      // Database delete still succeeds
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-fail-media' },
      });

      // Result includes cleanup warning containing the failed publicId for reconciliation
      expect(result.data.cleanupWarning).toContain('rongin/bad-media');
    });
  });
});
