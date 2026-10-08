import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryTransactionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventoryList(query: InventoryQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductVariantWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { sku: { contains: query.search, mode: 'insensitive' } },
        { size: { contains: query.search, mode: 'insensitive' } },
        { color: { contains: query.search, mode: 'insensitive' } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
        { product: { category: { name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    if (query.filter === 'LOW_STOCK') {
      where.stock = { gt: 0, lte: 5 };
    } else if (query.filter === 'OUT_OF_STOCK') {
      where.stock = { lte: 0 };
    } else if (query.filter === 'IN_STOCK') {
      where.stock = { gt: 5 };
    }

    const [items, total, totalActive, outOfStockCount, lowStockCount, inStockCount] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              fabric: true,
              alertThreshold: true,
              category: { select: { name: true } },
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.productVariant.count({ where }),
      this.prisma.productVariant.count({ where: { isActive: true } }),
      this.prisma.productVariant.count({ where: { isActive: true, stock: { lte: 0 } } }),
      this.prisma.productVariant.count({ where: { isActive: true, stock: { gt: 0, lte: 5 } } }),
      this.prisma.productVariant.count({ where: { isActive: true, stock: { gt: 5 } } }),
    ]);

    // Calculate reserved stock from active unfulfilled customer orders
    const variantIds = items.map((v) => v.id);
    const reservedGroups = variantIds.length > 0
      ? await this.prisma.orderItem.groupBy({
          by: ['variantId'],
          where: {
            variantId: { in: variantIds },
            order: {
              status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
            },
          },
          _sum: {
            quantity: true,
          },
        })
      : [];

    const reservedMap = new Map<string, number>();
    for (const r of reservedGroups) {
      if (r.variantId) {
        reservedMap.set(r.variantId, r._sum.quantity || 0);
      }
    }

    return {
      items: items.map((v) => {
        const reserved = reservedMap.get(v.id) || 0;
        const available = Math.max(0, v.stock);
        const onHand = available + reserved;
        const threshold = v.product.alertThreshold ?? 5;
        const status =
          available <= 0
            ? 'OUT OF STOCK'
            : available <= threshold
            ? 'LOW STOCK'
            : 'IN STOCK';

        return {
          id: v.id,
          variantId: v.id,
          productId: v.productId,
          productName: v.product.name,
          subtitle: v.product.fabric || 'Atelier Standard',
          category: v.product.category?.name || 'General',
          size: v.size,
          color: v.color,
          sku: v.sku,
          onHand,
          reserved,
          available,
          stock: available,
          alertThreshold: threshold,
          status,
          image: v.product.images[0]?.url || '',
        };
      }),
      summary: {
        activeCatalog: totalActive,
        inStock: inStockCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adjustStock(dto: AdjustStockDto, userId?: string) {
    return this.prisma.$transaction(async (transaction) => {
      const variant = await transaction.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) {
        throw new NotFoundException(`Product variant not found: ${dto.variantId}`);
      }

      const previousStock = variant.stock;
      const newStock = previousStock + dto.quantityChange;

      if (newStock < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current: ${previousStock}, Requested change: ${dto.quantityChange}`,
        );
      }

      const update = await transaction.productVariant.updateMany({
        where: { id: dto.variantId, stock: previousStock },
        data: { stock: newStock },
      });
      if (!update.count) {
        throw new ConflictException('Stock changed while adjusting; retry the adjustment');
      }
      const updatedVariant = await transaction.productVariant.findUniqueOrThrow({
        where: { id: dto.variantId },
      });

      // Map adjustment reason to database InventoryTransactionType enum
      let transactionType: InventoryTransactionType = InventoryTransactionType.ADJUSTMENT;
      if (dto.reason) {
        switch (dto.reason) {
          case 'RESTOCK':
            transactionType = InventoryTransactionType.RESTOCK;
            break;
          case 'SALE':
            transactionType = InventoryTransactionType.SALE;
            break;
          case 'RETURN':
          case 'ORDER_CANCELLED':
            transactionType = InventoryTransactionType.RETURN;
            break;
          case 'PURCHASE':
            transactionType = InventoryTransactionType.PURCHASE;
            break;
          default:
            transactionType = InventoryTransactionType.ADJUSTMENT;
            break;
        }
      } else if (dto.type) {
        transactionType = dto.type as InventoryTransactionType;
      }

      const formattedNote = dto.reason
        ? dto.note
          ? `[${dto.reason}] ${dto.note}`
          : `[${dto.reason}] Stock adjustment`
        : dto.note;

      const history = await transaction.inventoryTransaction.create({
        data: {
          variantId: dto.variantId,
          quantityChange: dto.quantityChange,
          previousStock,
          newStock,
          type: transactionType,
          note: formattedNote,
          userId,
        },
      });

      return {
        variant: updatedVariant,
        transaction: history,
      };
    });
  }

  async getTransactionHistory(variantId: string) {
    const records = await this.prisma.inventoryTransaction.findMany({
      where: { variantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((t) => {
      let reason = t.type as string;
      let note = t.note || '';
      let reference = '';

      if (t.note) {
        const match = t.note.match(/^\[([A-Z_]+)\]\s*(.*)$/);
        if (match) {
          reason = match[1];
          note = match[2] || '';
        }

        const refMatch = t.note.match(/(#RL[A-Za-z0-9_-]+|PO-[A-Za-z0-9_-]+)/i);
        if (refMatch) {
          reference = refMatch[1];
        }
      }

      return {
        id: t.id,
        variantId: t.variantId,
        quantityChange: t.quantityChange,
        previousStock: t.previousStock,
        newStock: t.newStock,
        type: t.type,
        reason,
        note,
        reference,
        createdAt: t.createdAt,
        user: t.user,
      };
    });
  }
}

