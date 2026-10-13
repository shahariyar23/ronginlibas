import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly mailService?: MailService,
  ) {}

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

  /**
   * Dispatches back-in-stock notification emails to all patrons who have wishlisted this product.
   */
  async notifyWishlistCustomersBackInStock(
    productId: string,
    variantDetails?: { size?: string; color?: string; stock?: number },
  ): Promise<{ notifiedCount: number }> {
    if (!this.mailService) {
      this.logger.warn('MailService not available for restock notifications');
      return { notifiedCount: 0 };
    }

    try {
      const wishlistedEntries = await this.prisma.wishlistItem.findMany({
        where: { productId },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: {
                select: { url: true, isPrimary: true },
                orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                take: 1,
              },
            },
          },
        },
      });

      if (!wishlistedEntries.length) {
        return { notifiedCount: 0 };
      }

      let count = 0;
      for (const entry of wishlistedEntries) {
        const customer = entry.customer;
        const product = entry.product;
        if (!customer?.email) continue;

        const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || undefined;
        const primaryImage = product.images?.[0]?.url;

        void this.mailService.sendBackInStockEmail({
          email: customer.email,
          customerName,
          productName: product.name,
          productSlug: product.slug,
          price: Number(product.price),
          imageUrl: primaryImage,
          size: variantDetails?.size,
          color: variantDetails?.color,
        });

        count++;
      }

      this.logger.log(
        `Dispatched restock notification email to ${count} customer(s) for product "${wishlistedEntries[0]?.product?.name}"`,
      );
      return { notifiedCount: count };
    } catch (err: any) {
      this.logger.error(`Error notifying wishlisted customers for product ${productId}: ${err?.message}`);
      return { notifiedCount: 0 };
    }
  }
}
