import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(customerId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { customerId, product: { isActive: true } },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            price: true,
            compareAtPrice: true,
            category: { select: { name: true, slug: true } },
            images: {
              select: { url: true, altText: true, isPrimary: true },
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 2,
            },
          },
        },
      },
    });
    return items.map(({ createdAt, product }) => ({
      createdAt,
      product: {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
      },
    }));
  }

  async add(customerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId, productId } },
      update: {},
      create: { customerId, productId },
    });
    return { added: true };
  }

  async remove(customerId: string, productId: string) {
    const result = await this.prisma.wishlistItem.deleteMany({
      where: { customerId, productId },
    });
    if (result.count === 0) throw new NotFoundException('Wishlist item not found');
    return { removed: true };
  }
}
