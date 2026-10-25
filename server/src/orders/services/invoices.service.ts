import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Invoice, InvoiceStatus, Prisma } from '@prisma/client';

export interface InvoiceWithDetails extends Invoice {
  items: Array<{
    id: string;
    invoiceId: string;
    productId: string | null;
    productVariantId: string | null;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    lineTotal: Prisma.Decimal;
    variantLabel: string | null;
    size: string | null;
    color: string | null;
    createdAt: Date;
  }>;
  payments?: Array<{
    id: string;
    provider: string;
    providerOrderId: string;
    providerInvoiceId: string | null;
    providerTransactionId: string | null;
    amount: Prisma.Decimal;
    status: string;
    paidAt: Date | null;
  }>;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: Date;
  };
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a transaction-safe sequential invoice number formatted as RL-INV-YYYY-XXXXXX.
   * Utilizes PostgreSQL ON CONFLICT DO UPDATE on invoice_sequences to guarantee atomic ordering
   * without race conditions even during concurrent payment settlements.
   */
  async generateNextInvoiceNumber(
    tx?: Prisma.TransactionClient,
    year?: number,
  ): Promise<string> {
    const client = tx || this.prisma;
    const currentYear = year ?? new Date().getFullYear();

    const result = await client.$queryRaw<Array<{ currentVal: number | string }>>`
      INSERT INTO "invoice_sequences" ("year", "currentVal")
      VALUES (${currentYear}, 1)
      ON CONFLICT ("year")
      DO UPDATE SET "currentVal" = "invoice_sequences"."currentVal" + 1
      RETURNING "currentVal";
    `;

    const rawVal = result[0]?.currentVal;
    const counter = Number(rawVal) || 1;
    const padded = String(counter).padStart(6, '0');
    return `RL-INV-${currentYear}-${padded}`;
  }

  /**
   * Atomically and idempotently creates or retrieves a customer-facing Invoice for an order.
   * If an invoice already exists for this order, returns the existing record immediately
   * without creating duplicate invoice or items.
   */
  async createInvoiceForOrderInTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    paymentId?: string,
  ): Promise<InvoiceWithDetails> {
    // 1. Idempotency Check: Order 1 -> Invoice 1
    const existing = await tx.invoice.findUnique({
      where: { orderId },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerInvoiceId: true,
            providerTransactionId: true,
            amount: true,
            status: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    if (existing) {
      if (paymentId) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { invoiceId: existing.id },
        });
      }
      return existing as InvoiceWithDetails;
    }

    // 2. Fetch Order with Items and Customer
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found for invoice creation.`);
    }

    // 3. Extract Customer snapshot details
    const shipping = (order.shippingAddress as Record<string, any>) || {};
    const customerName =
      (typeof shipping.fullName === 'string' && shipping.fullName.trim()) ||
      (typeof shipping.recipient === 'string' && shipping.recipient.trim()) ||
      (typeof shipping.name === 'string' && shipping.name.trim()) ||
      order.guestName ||
      (order.customer
        ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
        : 'Valued Patron');

    const customerEmail =
      (typeof shipping.email === 'string' && shipping.email.trim()) ||
      order.guestEmail ||
      order.customer?.email ||
      null;

    const customerPhone =
      (typeof shipping.phone === 'string' && shipping.phone.trim()) ||
      order.guestPhone ||
      order.customer?.phone ||
      null;

    // 4. Generate unique invoice number
    const invoiceNumber = await this.generateNextInvoiceNumber(tx);

    // 5. Build immutable invoice item snapshots
    const itemsData = (order.items || []).map((item) => ({
      productId: item.productId ?? null,
      productVariantId: item.variantId ?? null,
      productName: item.productName,
      sku: item.sku,
      quantity: Number(item.quantity),
      unitPrice: item.unitPrice,
      lineTotal: item.subtotal,
      variantLabel:
        item.variantName ||
        (item as any).variantLabel ||
        [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
          .filter(Boolean)
          .join(', ') ||
        null,
      size: item.size || null,
      color: item.color || null,
    }));

    // 6. Create Invoice record in database
    const createdInvoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        status: InvoiceStatus.ISSUED,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount || 0,
        deliveryCharge: order.deliveryCharge || 0,
        totalAmount: order.totalAmount,
        currency: 'BDT',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: order.shippingAddress as any,
        issuedAt: new Date(),
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerInvoiceId: true,
            providerTransactionId: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    // 7. Associate Payment with Invoice if paymentId provided
    if (paymentId) {
      await tx.payment.update({
        where: { id: paymentId },
        data: { invoiceId: createdInvoice.id },
      });
    }

    this.logger.log(
      `[Invoice] Issued customer invoice ${createdInvoice.invoiceNumber} for order ${order.orderNumber} (Total: ৳${Number(createdInvoice.totalAmount).toLocaleString()})`,
    );

    return createdInvoice as InvoiceWithDetails;
  }

  /**
   * Standalone method to ensure an invoice exists for an order.
   * Runs inside a Prisma transaction for consistency and safety.
   */
  async getOrCreateInvoiceForOrder(
    orderId: string,
    paymentId?: string,
  ): Promise<InvoiceWithDetails> {
    // 1. Fast check if invoice already exists without opening a transaction
    const existing = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerInvoiceId: true,
            providerTransactionId: true,
            amount: true,
            status: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    if (existing) {
      if (paymentId) {
        await this.prisma.payment
          .update({
            where: { id: paymentId },
            data: { invoiceId: existing.id },
          })
          .catch((err) => {
            this.logger.warn(
              `Failed to associate payment ${paymentId} with invoice ${existing.id}: ${err.message}`,
            );
          });
      }
      return existing as InvoiceWithDetails;
    }

    // 2. Narrowly-scoped transaction for newly creating the invoice record
    return this.prisma.$transaction(
      async (tx) => this.createInvoiceForOrderInTx(tx, orderId, paymentId),
      { maxWait: 5000, timeout: 10000 },
    );
  }

  /**
   * Finds an invoice by order ID or Order Number.
   */
  async findByOrderIdOrNumber(
    idOrNumber: string,
  ): Promise<InvoiceWithDetails | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        OR: [
          { orderId: idOrNumber },
          { order: { orderNumber: idOrNumber } },
          { order: { orderNumber: `#${idOrNumber.replace(/^#/, '')}` } },
        ],
      },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerInvoiceId: true,
            providerTransactionId: true,
            amount: true,
            status: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    return invoice as InvoiceWithDetails | null;
  }

  /**
   * Finds an invoice by its unique Rongin Libas invoice number (e.g. RL-INV-2026-000001).
   */
  async findByInvoiceNumber(
    invoiceNumber: string,
  ): Promise<InvoiceWithDetails | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            providerOrderId: true,
            providerInvoiceId: true,
            providerTransactionId: true,
            amount: true,
            status: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    return invoice as InvoiceWithDetails | null;
  }
}
