import {
  Injectable,
  Logger,
  Optional,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import type { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
import type { WaitmarkWebhookPayloadDto } from '../dto/waitmark-webhook.dto.js';

export interface WaitmarkInitiateResponse {
  checkoutUrl: string;
  paymentAttemptId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface WaitmarkStatusResponse {
  orderId: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  paymentReference: string | null;
  paymentMethod: PaymentMethod;
  payments: Array<{
    id: string;
    provider: string;
    providerOrderId: string;
    providerTransactionId: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    failureReason: string | null;
    paidAt: Date | null;
    createdAt: Date;
  }>;
}

@Injectable()
export class WaitmarkPaymentService {
  private readonly logger = new Logger(WaitmarkPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Optional() private readonly ordersService?: OrdersService,
    @Optional() private readonly ga4Service?: Ga4MeasurementProtocolService,
  ) {}

  /**
   * Returns Waitmark public key configured in environment.
   */
  public getPublicKey(): string | undefined {
    return this.configService.get<string>('WAITMARK_PUBLIC_KEY')?.trim();
  }

  /**
   * Returns Waitmark secret key configured in environment.
   */
  public getSecretKey(): string | undefined {
    return this.configService.get<string>('WAITMARK_SECRET_KEY')?.trim();
  }

  /**
   * Returns the Waitmark checkout gateway base URL.
   */
  public getCheckoutUrl(): string {
    return (
      this.configService.get<string>('WAITMARK_CHECKOUT_URL')?.trim() ||
      'https://pay.waitmark.com/checkout'
    );
  }

  /**
   * Returns the webhook success_url dispatched to Waitmark.
   */
  public getSuccessUrl(): string {
    const configured = this.configService.get<string>('WAITMARK_SUCCESS_URL')?.trim();
    if (configured) {
      return configured;
    }

    const backendUrl =
      this.configService.get<string>('BACKEND_URL')?.trim() ||
      `http://localhost:${this.configService.get<number>('PORT') || 4000}`;

    return `${backendUrl.replace(/\/+$/, '')}/api/v1/payments/waitmark/webhook`;
  }

  /**
   * Checks whether Waitmark Pay is configured and operational.
   */
  public isConfigured(): boolean {
    return Boolean(this.getPublicKey() && this.getSecretKey());
  }

  /**
   * Initiates payment for an existing order by creating a Payment record and
   * returning the official Waitmark Pay checkout redirect URL.
   */
  public async initiatePayment(
    dto: InitiateWaitmarkPaymentDto,
    requester?: { id?: string; role?: string; type?: string } | string,
  ): Promise<WaitmarkInitiateResponse> {
    const publicKey = this.getPublicKey();
    if (!publicKey) {
      this.logger.error('Waitmark Pay initiation rejected: WAITMARK_PUBLIC_KEY is not configured');
      throw new ServiceUnavailableException(
        'Online payment gateway is temporarily unconfigured. Please select Cash on Delivery or contact concierge support.',
      );
    }

    const requesterId = typeof requester === 'string' ? requester : requester?.id;
    const isAdmin =
      typeof requester === 'object' &&
      (requester?.type === 'admin' ||
        requester?.role === 'ADMIN' ||
        requester?.role === 'SUPER_ADMIN' ||
        requester?.role === 'MANAGER');

    // Step 1: Find order
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: dto.orderId },
          { orderNumber: dto.orderId },
          { payments: { some: { providerOrderId: dto.orderId } } },
        ],
      },
      include: {
        customer: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${dto.orderId}" not found`);
    }

    // Step 2: Ownership / Authorization verification
    if (!isAdmin) {
      if (order.customerId) {
        if (requesterId && requesterId !== order.customerId) {
          throw new ForbiddenException('You do not have permission to pay for this order.');
        }
      } else {
        // Guest order verification
        const shippingAddress: any = order.shippingAddress || {};
        const expectedPhone = (
          order.guestPhone ||
          shippingAddress.phone ||
          shippingAddress.receiverPhone ||
          ''
        )
          .replace(/\D/g, '')
          .slice(-11);

        const suppliedPhone = (dto.phone || '').replace(/\D/g, '').slice(-11);
        const phoneMatches = Boolean(expectedPhone && suppliedPhone && expectedPhone === suppliedPhone);
        const tokenMatches = Boolean(dto.trackingToken && order.trackingTokenHash);

        if (!requesterId && !phoneMatches && !tokenMatches) {
          throw new ForbiddenException(
            'Guest payment verification requires the contact mobile number associated with the order.',
          );
        }
      }
    }

    // Step 3: Lifecycle checks
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot initiate payment for a cancelled order.');
    }
    if (order.status === OrderStatus.RETURNED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException('Cannot initiate payment for a returned or refunded order.');
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This order has already been paid in full.');
    }

    // Step 4: Authoritative payable amount calculation
    const totalAmount = Number(order.totalAmount);
    const alreadyPaid = Number(order.paidAmount || 0);
    const payableAmount = Math.max(0, Math.round((totalAmount - alreadyPaid) * 100) / 100);

    if (payableAmount <= 0) {
      throw new BadRequestException('Payable amount for this order is zero.');
    }

    // Step 5: Clean order reference for Waitmark Pay (e.g. RL11552343DE20)
    const sanitizedOrderRef = order.orderNumber.replace(/[^A-Za-z0-9]/g, '');

    // Check if an existing PENDING payment attempt exists for this order
    const existingPending = await this.prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: PaymentStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    let paymentAttemptId: string;

    if (existingPending) {
      if (existingPending.providerOrderId.startsWith('WMPAY-')) {
        const conflict = await this.prisma.payment.findFirst({
          where: {
            providerOrderId: sanitizedOrderRef,
            id: { not: existingPending.id },
          },
        });
        paymentAttemptId = conflict
          ? `${sanitizedOrderRef}-${Date.now().toString().slice(-4)}`
          : sanitizedOrderRef;

        await this.prisma.payment.update({
          where: { id: existingPending.id },
          data: {
            providerOrderId: paymentAttemptId,
            amount: payableAmount,
          },
        });
      } else {
        paymentAttemptId = existingPending.providerOrderId;
        await this.prisma.payment.update({
          where: { id: existingPending.id },
          data: {
            amount: payableAmount,
          },
        });
      }
    } else {
      // Use clean order number directly. If already claimed by another record, append timestamp suffix.
      const conflict = await this.prisma.payment.findUnique({
        where: { providerOrderId: sanitizedOrderRef },
      });
      paymentAttemptId = conflict
        ? `${sanitizedOrderRef}-${Date.now().toString().slice(-4)}`
        : sanitizedOrderRef;

      // Step 6: Persist Payment attempt in database
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'WAITMARK_PAY',
          providerOrderId: paymentAttemptId,
          amount: payableAmount,
          currency: 'BDT',
          status: PaymentStatus.PENDING,
        },
      });
    }

    if (order.paymentStatus === PaymentStatus.FAILED) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.PENDING },
      });
    }

    this.logger.log(
      `[Waitmark Pay] Prepared payment attempt ${paymentAttemptId} for order ${order.orderNumber} (Amount: ৳${payableAmount})`,
    );

    // Step 7: Construct official Waitmark checkout URL
    const gatewayBaseUrl = this.getCheckoutUrl();
    const successUrl = this.getSuccessUrl();
    const backendUrl =
      this.configService.get<string>('BACKEND_URL')?.trim() ||
      `http://localhost:${this.configService.get<number>('PORT') || 4000}`;
    const cleanBackendUrl = backendUrl.replace(/\/+$/, '');
    const cancelUrl = `${cleanBackendUrl}/api/v1/payments/waitmark/webhook?status=cancelled&order_id=${encodeURIComponent(paymentAttemptId)}`;
    const failUrl = `${cleanBackendUrl}/api/v1/payments/waitmark/webhook?status=failed&order_id=${encodeURIComponent(paymentAttemptId)}`;

    const checkoutUrl = `${gatewayBaseUrl}?public_key=${encodeURIComponent(publicKey)}&amount=${encodeURIComponent(
      payableAmount.toFixed(2),
    )}&order_id=${encodeURIComponent(paymentAttemptId)}&success_url=${encodeURIComponent(
      successUrl,
    )}&cancel_url=${encodeURIComponent(cancelUrl)}&fail_url=${encodeURIComponent(failUrl)}`;

    return {
      checkoutUrl,
      paymentAttemptId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: payableAmount,
      currency: 'BDT',
    };
  }

  /**
   * Releases stock and deletes an unpaid or failed order.
   */
  public async handleFailedPayment(
    orderId: string,
    reason: string = 'Payment failed / cancelled',
    existingOrder?: any,
  ): Promise<{ success: boolean; message: string }> {
    if (this.ordersService && typeof this.ordersService.deleteUnpaidOrFailedOrder === 'function') {
      const res = await this.ordersService.deleteUnpaidOrFailedOrder(orderId, reason);
      return { success: true, message: res.message };
    }

    const order =
      existingOrder ||
      (await this.prisma.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId },
            { payments: { some: { providerOrderId: orderId } } },
          ],
        },
        include: { items: true },
      }));

    if (!order) return { success: true, message: 'Order not found or already deleted' };
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { success: false, message: 'Cannot delete already paid order' };
    }

    await this.prisma.$transaction(async (tx) => {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant?.findUnique?.({
            where: { id: item.variantId },
            select: { id: true, stock: true },
          });
          if (variant) {
            await tx.productVariant?.updateMany?.({
              where: { id: variant.id, stock: variant.stock },
              data: { stock: variant.stock + item.quantity },
            });
            await tx.inventoryTransaction?.create?.({
              data: {
                variantId: variant.id,
                quantityChange: item.quantity,
                previousStock: variant.stock,
                newStock: variant.stock + item.quantity,
                type: 'RETURN',
                note: `Restored stock from failed payment order ${order.orderNumber}`,
              },
            });
          }
        }
      }

      if (typeof tx.order?.delete === 'function') {
        await tx.order.delete({
          where: { id: order.id },
        });
      } else if (typeof tx.order?.update === 'function') {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
        });
      }
    });

    this.logger.log(`[Waitmark Pay] Order ${order.orderNumber} deleted and reserved stock released (${reason})`);
    return {
      success: true,
      message: `Order ${order.orderNumber} deleted and inventory stock restored`,
    };
  }

  /**
   * Verifies HMAC-SHA256 signature against X-Waitmark-Signature header and
   * idempotently updates Payment and Order atomically.
   */
  public async processWebhook(
    rawBody: Buffer | string,
    signatureHeader?: string,
  ): Promise<{ success: boolean; message: string; idempotent?: boolean }> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      this.logger.error('Waitmark webhook rejected: WAITMARK_SECRET_KEY is not configured on server');
      throw new ServiceUnavailableException('Payment webhook secret key is not configured.');
    }

    if (!signatureHeader || !signatureHeader.trim()) {
      this.logger.warn('Waitmark webhook rejected: Missing X-Waitmark-Signature header');
      throw new ForbiddenException('Missing X-Waitmark-Signature header');
    }

    const payloadBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');

    // Step 1: Compute expected HMAC-SHA256 hash
    const expectedSignature = createHmac('sha256', secretKey)
      .update(payloadBuffer)
      .digest('hex');

    const cleanReceived = signatureHeader.trim().toLowerCase();
    const cleanExpected = expectedSignature.toLowerCase();

    // Step 2: Constant-time comparison
    let isSignatureValid = false;
    try {
      const receivedBuf = Buffer.from(cleanReceived, 'hex');
      const expectedBuf = Buffer.from(cleanExpected, 'hex');
      if (receivedBuf.length === expectedBuf.length && timingSafeEqual(receivedBuf, expectedBuf)) {
        isSignatureValid = true;
      }
    } catch {
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      this.logger.error(
        `Waitmark webhook signature verification failed. Expected: ${cleanExpected}, Received: ${cleanReceived}`,
      );
      throw new ForbiddenException('Invalid signature: HMAC-SHA256 verification failed');
    }

    // Step 3: Parse validated JSON payload
    let payload: WaitmarkWebhookPayloadDto;
    try {
      payload = JSON.parse(payloadBuffer.toString('utf8'));
    } catch (parseErr: any) {
      this.logger.error(`Waitmark webhook payload JSON parse error: ${parseErr?.message}`);
      throw new BadRequestException('Malformed JSON payload');
    }

    const { order_id: providerOrderId, trx_id, amount, status, currency } = payload;

    if (!providerOrderId || !trx_id || amount === undefined || !status) {
      this.logger.error('Waitmark webhook missing required fields: ' + JSON.stringify(payload));
      throw new BadRequestException('Incomplete webhook payload fields');
    }

    this.logger.log(
      `[Waitmark Webhook] Received verified IPN for order_id: ${providerOrderId}, trx_id: ${trx_id}, status: ${status}, amount: ${amount}`,
    );

    // Step 4: Retrieve payment record
    let payment = await this.prisma.payment.findUnique({
      where: { providerOrderId },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
          },
        },
      },
    });

    if (!payment) {
      payment = await this.prisma.payment.findFirst({
        where: {
          OR: [
            { order: { orderNumber: providerOrderId } },
            { order: { orderNumber: `#${providerOrderId}` } },
            { order: { orderNumber: { contains: providerOrderId } } },
            { orderId: providerOrderId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              customer: true,
              items: true,
            },
          },
        },
      });
    }

    if (!payment) {
      this.logger.error(`Waitmark webhook payment attempt not found for order_id: ${providerOrderId}`);
      throw new NotFoundException(`Payment record not found for provider order ID: ${providerOrderId}`);
    }

    // Step 5: Idempotency check: If already marked PAID, return successfully without re-applying side effects
    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(
        `[Waitmark Webhook] Idempotent delivery: Payment ${providerOrderId} already confirmed as PAID.`,
      );
      return {
        success: true,
        message: 'Payment was already verified and processed previously.',
        idempotent: true,
      };
    }

    // Step 5b: Prevent duplicate transaction ID from paying multiple orders
    const duplicatePayment =
      typeof this.prisma.payment.findFirst === 'function'
        ? await this.prisma.payment.findFirst({
            where: {
              providerTransactionId: trx_id,
              id: { not: payment.id },
              status: PaymentStatus.PAID,
            },
          })
        : null;
    if (duplicatePayment) {
      this.logger.error(
        `[Waitmark Webhook] Duplicate transaction ID rejected: ${trx_id} has already been credited to payment ${duplicatePayment.id}`,
      );
      throw new BadRequestException('Transaction ID has already been utilized for another payment');
    }

    const duplicateOrder =
      typeof this.prisma.order.findFirst === 'function'
        ? await this.prisma.order.findFirst({
            where: {
              paymentReference: trx_id,
              id: { not: payment.orderId },
              paymentStatus: PaymentStatus.PAID,
            },
          })
        : null;
    if (duplicateOrder) {
      this.logger.error(
        `[Waitmark Webhook] Duplicate transaction ID rejected: ${trx_id} has already been credited to order ${duplicateOrder.orderNumber}`,
      );
      throw new BadRequestException('Transaction ID has already been utilized for another order');
    }

    // Step 5c: Currency verification
    const expectedCurrency = (payment.currency || 'BDT').toUpperCase();
    if (currency && currency.trim().toUpperCase() !== expectedCurrency) {
      this.logger.error(
        `Waitmark webhook currency mismatch: Expected ${expectedCurrency}, received ${currency} for ${providerOrderId}`,
      );
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: `Currency mismatch: expected ${payment.currency}, received ${currency}`,
          providerTransactionId: trx_id,
          rawWebhookPayload: payload as any,
        },
      });
      await this.handleFailedPayment(
        payment.orderId,
        `Currency mismatch: expected ${payment.currency}, received ${currency}`,
        payment.order,
      );
      throw new BadRequestException('Payment currency mismatch');
    }

    // Step 6: Amount verification
    const webhookAmount = Number(amount);
    const expectedAmount = Number(payment.amount);
    if (Math.abs(webhookAmount - expectedAmount) > 0.01) {
      this.logger.error(
        `Waitmark webhook amount mismatch: Expected ৳${expectedAmount}, received ৳${webhookAmount} for ${providerOrderId}`,
      );
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: `Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`,
          providerTransactionId: trx_id,
          rawWebhookPayload: payload as any,
        },
      });
      await this.handleFailedPayment(
        payment.orderId,
        `Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`,
        payment.order,
      );
      throw new BadRequestException('Payment amount mismatch between order and gateway');
    }

    // Step 7: Handle non-completed statuses safely
    if (status.toLowerCase() !== 'completed') {
      const isExplicitFailure = ['failed', 'cancelled', 'declined', 'rejected', 'expired'].includes(
        status.toLowerCase(),
      );
      this.logger.warn(`Waitmark webhook reported non-completed status: "${status}" for ${providerOrderId}`);
      if (isExplicitFailure) {
        await this.handleFailedPayment(
          payment.orderId,
          `Gateway reported status: ${status}`,
          payment.order,
        );
        return {
          success: false,
          message: `Payment failed (${status}). Order deleted and inventory stock restored.`,
        };
      }
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PENDING,
          failureReason: `Gateway reported status: ${status}`,
          providerTransactionId: trx_id,
          rawWebhookPayload: payload as any,
        },
      });
      return {
        success: false,
        message: `Payment status received as ${status}`,
      };
    }

    // Step 8: Atomic database transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Mark payment as PAID
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerTransactionId: trx_id,
          paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
          rawWebhookPayload: payload as any,
        },
      });

      // 2. Fetch fresh order state
      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
      });

      if (!order) return;

      // Handle edge case: order was cancelled prior to payment completion
      if (order.status === OrderStatus.CANCELLED) {
        this.logger.warn(
          `[Waitmark Webhook] Alert: Order ${order.orderNumber} was CANCELLED before payment confirmation! Setting paidAmount and flagging for review.`,
        );
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: PaymentMethod.WAITMARK_PAY,
            paymentReference: trx_id,
            paidAmount: payment.amount,
            adminNotes: [
              order.adminNotes,
              `[RECONCILIATION NEEDED] Order was cancelled prior to receiving confirmed Waitmark payment of ৳${payment.amount} (Trx: ${trx_id}).`,
            ]
              .filter(Boolean)
              .join('\n'),
          },
        });
        return;
      }

      // Normal order progression
      const nextOrderStatus =
        order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status;

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextOrderStatus,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.WAITMARK_PAY,
          paymentReference: trx_id,
          paidAmount: payment.amount,
        },
      });

      // 3. Record customer-visible tracking event
      await tx.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          status: nextOrderStatus,
          description: `Online payment received via Waitmark Pay (Transaction ID: ${trx_id})`,
          customerVisible: true,
        },
      });
    });

    this.logger.log(
      `[Waitmark Webhook] Successfully verified and marked order ${payment.order.orderNumber} as PAID (Trx: ${trx_id})`,
    );

    // Dispatch official Order Confirmation email to customer now that payment is verified
    if (this.ordersService) {
      this.ordersService.dispatchConfirmationNotificationForPaidOrder(payment.order.id).catch((err) => {
        this.logger.warn(`Failed to dispatch confirmation email after Waitmark payment for ${payment.order.orderNumber}: ${err.message}`);
      });
    }

    // Report server-side verified purchase to Google Analytics 4 via Measurement Protocol
    if (this.ga4Service) {
      this.ga4Service
        .sendPurchaseEvent({
          id: payment.order.id,
          orderNumber: payment.order.orderNumber,
          totalAmount: payment.order.totalAmount,
          customerId: payment.order.customerId,
          items: payment.order.items,
        })
        .catch((err) => {
          this.logger.warn(
            `Failed to report GA4 MP purchase after online payment for ${payment.order.orderNumber}: ${err.message}`,
          );
        });
    }

    return {
      success: true,
      message: 'Payment verified and order updated successfully',
    };
  }

  /**
   * Retrieves secure payment status for an order.
   */
  public async getPaymentStatus(
    orderId: string,
    requester?: { id?: string; role?: string; type?: string } | string,
    phone?: string,
    trackingToken?: string,
  ): Promise<WaitmarkStatusResponse> {
    const requesterId = typeof requester === 'string' ? requester : requester?.id;
    const isAdmin =
      typeof requester === 'object' &&
      (requester?.type === 'admin' ||
        requester?.role === 'ADMIN' ||
        requester?.role === 'SUPER_ADMIN' ||
        requester?.role === 'MANAGER');

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
          { payments: { some: { providerOrderId: orderId } } },
          { payments: { some: { providerInvoiceId: orderId } } },
        ],
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return {
        orderId,
        orderNumber: orderId,
        paymentStatus: PaymentStatus.FAILED,
        orderStatus: OrderStatus.CANCELLED,
        totalAmount: 0,
        paidAmount: 0,
        paymentReference: null,
        paymentMethod: PaymentMethod.WAITMARK_PAY,
        payments: [],
      };
    }

    // Ownership verification for customers and guests
    if (!isAdmin) {
      if (order.customerId) {
        if (requesterId && requesterId !== order.customerId) {
          throw new ForbiddenException('You do not have permission to view payment status for this order.');
        }
      } else {
        const shippingAddress: any = order.shippingAddress || {};
        const expectedPhone = (
          order.guestPhone ||
          shippingAddress.phone ||
          shippingAddress.receiverPhone ||
          ''
        )
          .replace(/\D/g, '')
          .slice(-11);

        const suppliedPhone = (phone || '').replace(/\D/g, '').slice(-11);
        const phoneMatches = Boolean(expectedPhone && suppliedPhone && expectedPhone === suppliedPhone);
        const tokenMatches = Boolean(trackingToken && order.trackingTokenHash);

        // If neither authenticated, phone matched, nor tracking token, reject
        if (!requesterId && !phoneMatches && !tokenMatches) {
          throw new ForbiddenException('Access denied. Please provide contact phone or tracking token.');
        }
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount || 0),
      paymentReference: order.paymentReference,
      paymentMethod: order.paymentMethod,
      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        providerTransactionId: p.providerTransactionId,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        failureReason: p.failureReason,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }
}
