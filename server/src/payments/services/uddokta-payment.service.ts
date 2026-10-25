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
import { InvoicesService } from '../../orders/services/invoices.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import type { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import type { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';

export interface UddoktaInitiateResponse {
  checkoutUrl: string;
  paymentAttemptId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface UddoktaVerifyResponse {
  success: boolean;
  message: string;
  isPaid: boolean;
  orderId: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  amount: number;
  transactionId?: string | null;
  invoiceId?: string | null;
  paymentMethod?: string | null;
  customerInvoiceNumber?: string | null;
}

@Injectable()
export class UddoktaPaymentService {
  private readonly logger = new Logger(UddoktaPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Optional() private readonly ordersService?: OrdersService,
    @Optional() private readonly invoicesService?: InvoicesService,
    @Optional() private readonly ga4Service?: Ga4MeasurementProtocolService,
  ) {}

  /**
   * Returns UddoktaPay API key configured in environment.
   */
  public getApiKey(): string | undefined {
    return this.configService.get<string>('UDDOKTAPAY_API_KEY')?.trim();
  }

  /**
   * Returns current UddoktaPay environment ('sandbox' | 'production').
   * Defaults to 'sandbox' unless UDDOKTAPAY_ENV is explicitly set to 'production'.
   */
  public getEnvironment(): 'sandbox' | 'production' {
    const env = this.configService.get<string>('UDDOKTAPAY_ENV')?.trim().toLowerCase();
    if (env === 'production' || env === 'prod' || env === 'live') {
      return 'production';
    }
    return 'sandbox';
  }

  /**
   * Returns true if UddoktaPay is operating in Sandbox / Test mode.
   */
  public isSandbox(): boolean {
    return this.getEnvironment() === 'sandbox';
  }

  /**
   * Returns UddoktaPay base URL.
   * Resolves to https://sandbox.uddoktapay.com when in sandbox mode,
   * or https://ronginlibas.paymently.io/api when in production mode unless overridden.
   */
  public getBaseUrl(): string {
    const explicitUrl = this.configService.get<string>('UDDOKTAPAY_BASE_URL')?.trim();
    if (explicitUrl) return explicitUrl;

    return this.isSandbox()
      ? 'https://sandbox.uddoktapay.com'
      : 'https://ronginlibas.paymently.io/api';
  }

  /**
   * Normalizes and constructs UddoktaPay API endpoint URL.
   * Handles base URLs whether configured with or without trailing `/api`, `/checkout-v2`, or `/`.
   * e.g., "https://sandbox.uddoktapay.com" + "checkout-v2" -> "https://sandbox.uddoktapay.com/api/checkout-v2"
   * e.g., "https://sandbox.uddoktapay.com" + "verify-payment" -> "https://sandbox.uddoktapay.com/api/verify-payment"
   * e.g., "https://sandbox.uddoktapay.com" + "refund-payment" -> "https://sandbox.uddoktapay.com/api/refund-payment"
   */
  public getApiEndpoint(subPath: string): string {
    const rawBase = this.getBaseUrl().replace(/\/+$/, '');
    const baseWithoutApi = rawBase
      .replace(/\/api\/checkout-v2\/?$/, '')
      .replace(/\/checkout-v2\/?$/, '')
      .replace(/\/api\/?$/, '');
    const cleanPath = subPath.replace(/^\/+/, '');
    const apiPath = cleanPath.startsWith('api/') ? cleanPath : `api/${cleanPath}`;
    return `${baseWithoutApi}/${apiPath}`;
  }

  /**
   * Checks whether UddoktaPay is configured and operational.
   */
  public isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Returns customer-facing frontend base URL.
   */
  public getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL')?.trim() ||
      this.configService.get<string>('WEB_FRONTEND_URL')?.trim() ||
      'http://localhost:3000'
    );
  }

  /**
   * Returns backend publicly reachable HTTPS base URL for webhooks and callbacks.
   */
  public getBackendPublicUrl(): string {
    const publicUrl =
      this.configService.get<string>('BACKEND_PUBLIC_URL')?.trim() ||
      this.configService.get<string>('BACKEND_URL')?.trim();
    if (publicUrl) return publicUrl;

    const port = this.configService.get<number>('PORT') || 4000;
    return `http://localhost:${port}`;
  }

  /**
   * Creates a hosted payment session with UddoktaPay for an eligible order.
   */
  public async initiatePayment(
    dto: InitiateUddoktaPaymentDto,
    requester?: { id?: string; role?: string; type?: string } | string,
  ): Promise<UddoktaInitiateResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error('UddoktaPay initiation rejected: UDDOKTAPAY_API_KEY is not configured');
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
          { payments: { some: { providerInvoiceId: dto.orderId } } },
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

    // Step 5: Clean internal payment reference
    const sanitizedOrderRef = order.orderNumber.replace(/[^A-Za-z0-9]/g, '');
    const defaultAttemptId = `UPAY-${sanitizedOrderRef}`;

    // Check if an existing PENDING payment attempt exists for this order
    const existingPending = await this.prisma.payment.findFirst({
      where: {
        orderId: order.id,
        provider: 'UDDOKTAPAY',
        status: PaymentStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    let paymentAttemptId: string;

    if (existingPending) {
      paymentAttemptId = existingPending.providerOrderId;
      await this.prisma.payment.update({
        where: { id: existingPending.id },
        data: {
          amount: payableAmount,
        },
      });
    } else {
      const conflict = await this.prisma.payment.findUnique({
        where: { providerOrderId: defaultAttemptId },
      });
      paymentAttemptId = conflict
        ? `${defaultAttemptId}-${Date.now().toString().slice(-4)}`
        : defaultAttemptId;

      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'UDDOKTAPAY',
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

    // Step 6: Customer info for UddoktaPay session
    const shippingAddress: any = order.shippingAddress || {};
    const customerName =
      (order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : '') ||
      order.guestName ||
      shippingAddress.fullName ||
      shippingAddress.name ||
      'Rongin Libas Customer';

    const customerEmail =
      order.customer?.email ||
      order.guestEmail ||
      shippingAddress.email ||
      'customer@runginlibas.com';

    // Step 7: Call UddoktaPay Hosted Checkout API (POST /api/checkout-v2)
    const checkoutEndpoint = this.getApiEndpoint('checkout-v2');
    const backendUrl = this.getBackendPublicUrl().replace(/\/+$/, '');

    const redirectUrl =
      this.configService.get<string>('UDDOKTAPAY_SUCCESS_URL')?.trim() ||
      `${backendUrl}/api/v1/payments/uddoktapay/redirect?order_id=${encodeURIComponent(
        order.orderNumber,
      )}`;
    const cancelUrl =
      this.configService.get<string>('UDDOKTAPAY_CANCEL_URL')?.trim() ||
      `${backendUrl}/api/v1/payments/uddoktapay/cancel?order_id=${encodeURIComponent(
        order.orderNumber,
      )}`;
    const webhookUrl =
      this.configService.get<string>('UDDOKTAPAY_WEBHOOK_URL')?.trim() ||
      `${backendUrl}/api/v1/payments/uddoktapay/webhook`;

    const requestPayload = {
      full_name: customerName,
      email: customerEmail,
      amount: payableAmount.toFixed(2),
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        payment_attempt_id: paymentAttemptId,
      },
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      webhook_url: webhookUrl,
      return_type: 'GET',
    };

    this.logger.log(
      `[UddoktaPay] Creating checkout session for order ${order.orderNumber} (attempt: ${paymentAttemptId}, amount: ৳${payableAmount})`,
    );

    let checkoutUrl: string;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      const response = await fetch(checkoutEndpoint, {
        method: 'POST',
        headers: {
          'RT-UDDOKTAPAY-API-KEY': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData: any = await response.json().catch(() => null);

      if (!response.ok || !responseData) {
        this.logger.error(
          `[UddoktaPay] Session creation failed (HTTP ${response.status}): ${JSON.stringify(
            responseData || {},
          )}`,
        );
        throw new ServiceUnavailableException(
          responseData?.message || 'UddoktaPay session creation failed. Please try again.',
        );
      }

      // UddoktaPay returns payment_url in response
      const targetUrl = responseData.payment_url || responseData.data?.payment_url;
      if (!targetUrl) {
        this.logger.error(
          `[UddoktaPay] Missing payment_url in response: ${JSON.stringify(responseData)}`,
        );
        throw new ServiceUnavailableException(
          'UddoktaPay session did not provide a checkout URL. Please try again.',
        );
      }

      checkoutUrl = targetUrl;

      // Extract upstream invoice ID if returned by gateway (some versions/paymently include invoice_id)
      const upstreamInvoiceId =
        responseData.invoice_id ||
        responseData.data?.invoice_id ||
        responseData.invoiceId ||
        responseData.data?.invoiceId;

      try {
        await this.prisma.payment.updateMany({
          where: { providerOrderId: paymentAttemptId },
          data: {
            rawWebhookPayload: responseData as any,
            ...(upstreamInvoiceId ? { providerInvoiceId: upstreamInvoiceId.toString().trim() } : {}),
          },
        });
      } catch (saveErr: any) {
        this.logger.warn(`Could not attach initiation payload to payment ${paymentAttemptId}: ${saveErr?.message}`);
      }
    } catch (apiErr: any) {
      if (apiErr instanceof ServiceUnavailableException) throw apiErr;
      this.logger.error(
        `[UddoktaPay] Upstream API call exception: ${apiErr?.message || apiErr}`,
      );
      throw new ServiceUnavailableException(
        'Unable to connect to UddoktaPay payment gateway. Please check your connection or choose another method.',
      );
    }

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
   * Helper to attach providerInvoiceId to an existing pending payment attempt.
   */
  public async recordInvoiceIdIfPending(orderIdHint: string, invoiceId: string): Promise<boolean> {
    if (!orderIdHint || !invoiceId) return false;
    const cleanHint = orderIdHint.trim();
    const bareHint = cleanHint.replace(/^#/, '');
    const withHash = `#${bareHint}`;
    const cleanInvoiceId = invoiceId.trim();

    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: 'UDDOKTAPAY',
        status: PaymentStatus.PENDING,
        OR: [
          { orderId: cleanHint },
          { order: { orderNumber: cleanHint } },
          { order: { orderNumber: bareHint } },
          { order: { orderNumber: withHash } },
          { providerOrderId: cleanHint },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { providerInvoiceId: cleanInvoiceId },
      });
      this.logger.log(
        `[UddoktaPay] Associated invoice_id "${cleanInvoiceId}" with pending payment attempt for order ${orderIdHint}`,
      );
      return true;
    }
    return false;
  }

  /**
   * Verifies an UddoktaPay payment using the server-to-server Verify Payment API.
   * Safe: Does not rely on client-supplied data or browser state.
   */
  public async verifyPayment(
    invoiceId?: string,
    orderIdHint?: string,
  ): Promise<UddoktaVerifyResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('UddoktaPay API key is not configured.');
    }

    let cleanInvoiceId = (invoiceId || '').trim();

    if (!cleanInvoiceId && orderIdHint) {
      const cleanHint = orderIdHint.trim();
      const bareHint = cleanHint.replace(/^#/, '');
      const withHash = `#${bareHint}`;
      const foundPayment = await this.prisma.payment.findFirst({
        where: {
          provider: 'UDDOKTAPAY',
          providerInvoiceId: { not: null },
          OR: [
            { orderId: cleanHint },
            { order: { orderNumber: cleanHint } },
            { order: { orderNumber: bareHint } },
            { order: { orderNumber: withHash } },
            { providerOrderId: cleanHint },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (foundPayment?.providerInvoiceId) {
        cleanInvoiceId = foundPayment.providerInvoiceId.trim();
        this.logger.log(
          `[UddoktaPay] Resolved invoice_id "${cleanInvoiceId}" from order hint "${orderIdHint}"`,
        );
      }
    }

    if (!cleanInvoiceId) {
      throw new BadRequestException('Valid invoice_id is required for verification.');
    }

    const verifyEndpoint = this.getApiEndpoint('verify-payment');

    this.logger.log(`[UddoktaPay] Verifying transaction server-side for invoice_id: ${cleanInvoiceId}`);

    let verifyResult: any;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'RT-UDDOKTAPAY-API-KEY': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ invoice_id: cleanInvoiceId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      verifyResult = await response.json().catch(() => null);

      if (!response.ok || !verifyResult) {
        this.logger.error(
          `[UddoktaPay] Verify API returned HTTP ${response.status}: ${JSON.stringify(verifyResult)}`,
        );
        throw new ServiceUnavailableException('Failed to communicate with UddoktaPay verification service.');
      }
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException || err instanceof BadRequestException) throw err;
      this.logger.error(`[UddoktaPay] Verify network error: ${err?.message || err}`);
      throw new ServiceUnavailableException('UddoktaPay verification network timeout or unreachable.');
    }

    // Response structure can be flat (standard UddoktaPay live API) or nested inside data:
    // Flat: { status: 'COMPLETED', invoice_id: '...', amount: '10.00', metadata: { ... }, transaction_id: '...' }
    // Nested: { status: true, data: { status: 'COMPLETED', ... } }
    const invoiceData =
      verifyResult && typeof verifyResult === 'object'
        ? verifyResult.data && typeof verifyResult.data === 'object'
          ? { ...verifyResult, ...verifyResult.data }
          : verifyResult
        : {};

    const rawStatus = (invoiceData.status ?? verifyResult?.status ?? '').toString();
    const gatewayStatus = rawStatus.trim().toUpperCase();

    const metadata = invoiceData.metadata || verifyResult?.metadata || {};
    const paymentAttemptId = metadata.payment_attempt_id;
    const metadataOrderId = metadata.order_id || metadata.order_number;
    const resolvedOrderHint = metadataOrderId || orderIdHint;

    const cleanOrderNumber = resolvedOrderHint
      ? resolvedOrderHint.startsWith('#')
        ? resolvedOrderHint
        : `#${resolvedOrderHint}`
      : null;
    const bareOrderNumber = resolvedOrderHint
      ? resolvedOrderHint.replace(/^#/, '')
      : null;

    // Retrieve payment record
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { providerInvoiceId: cleanInvoiceId },
          ...(paymentAttemptId ? [{ providerOrderId: paymentAttemptId }] : []),
          ...(resolvedOrderHint ? [{ orderId: resolvedOrderHint }] : []),
          ...(cleanOrderNumber ? [{ order: { orderNumber: cleanOrderNumber } }] : []),
          ...(bareOrderNumber ? [{ order: { orderNumber: bareOrderNumber } }] : []),
        ],
      },
      include: {
        order: {
          include: { customer: true, items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      this.logger.warn(`[UddoktaPay] No payment record found for verified invoice_id: ${cleanInvoiceId}`);
      return {
        success: false,
        message: 'Payment record not found in system.',
        isPaid: false,
        orderId: resolvedOrderHint || cleanInvoiceId,
        orderNumber: resolvedOrderHint || cleanInvoiceId,
        paymentStatus: PaymentStatus.PENDING,
        amount: Number(invoiceData.amount || invoiceData.charged_amount || 0),
        invoiceId: cleanInvoiceId,
      };
    }

    // Step: Handle COMPLETED status
    if (gatewayStatus === 'COMPLETED' || gatewayStatus === 'SUCCESS') {
      const verifiedAmount = Number(invoiceData.amount || invoiceData.charged_amount || payment.amount);
      const trxId = invoiceData.transaction_id || invoiceData.trx_id || cleanInvoiceId;
      const channel = invoiceData.payment_method || 'UddoktaPay';

      const applied = await this.applySuccessfulPayment(payment, cleanInvoiceId, trxId, verifiedAmount, verifyResult, channel);

      return {
        success: true,
        message: 'Payment verified and settled successfully.',
        isPaid: true,
        orderId: payment.order.id,
        orderNumber: payment.order.orderNumber,
        paymentStatus: PaymentStatus.PAID,
        amount: verifiedAmount,
        transactionId: trxId,
        invoiceId: cleanInvoiceId,
        paymentMethod: channel,
        customerInvoiceNumber: applied?.customerInvoiceNumber || null,
      };
    }

    // Step: Handle PENDING status
    if (gatewayStatus === 'PENDING') {
      return {
        success: true,
        message: 'Payment is pending confirmation with payment provider.',
        isPaid: false,
        orderId: payment.order.id,
        orderNumber: payment.order.orderNumber,
        paymentStatus: PaymentStatus.PENDING,
        amount: Number(payment.amount),
        invoiceId: cleanInvoiceId,
      };
    }

    // Step: Handle ERROR / FAILED status
    if (gatewayStatus === 'ERROR' || gatewayStatus === 'FAILED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: verifyResult.message || 'Payment reported as failed/error by UddoktaPay',
          providerInvoiceId: cleanInvoiceId,
          rawWebhookPayload: verifyResult as any,
        },
      });

      return {
        success: false,
        message: verifyResult.message || 'Payment failed or was cancelled.',
        isPaid: false,
        orderId: payment.order.id,
        orderNumber: payment.order.orderNumber,
        paymentStatus: PaymentStatus.FAILED,
        amount: Number(payment.amount),
        invoiceId: cleanInvoiceId,
      };
    }

    return {
      success: false,
      message: `Unknown payment status: ${gatewayStatus}`,
      isPaid: false,
      orderId: payment.order.id,
      orderNumber: payment.order.orderNumber,
      paymentStatus: payment.status,
      amount: Number(payment.amount),
      invoiceId: cleanInvoiceId,
    };
  }

  /**
   * Processes an incoming Instant Payment Notification (IPN) webhook from UddoktaPay.
   */
  public async processWebhook(
    headers: Record<string, any>,
    payload: UddoktaWebhookPayloadDto,
  ): Promise<{ success: boolean; message: string; idempotent?: boolean }> {
    const configuredApiKey = this.getApiKey();
    if (!configuredApiKey) {
      this.logger.error('[UddoktaPay Webhook] Received webhook but UDDOKTAPAY_API_KEY is not set');
      throw new ServiceUnavailableException('Payment gateway webhook key is not configured.');
    }

    // Step 1: Validate RT-UDDOKTAPAY-API-KEY header (case-insensitive lookup)
    const receivedApiKey = (
      headers['rt-uddoktapay-api-key'] ||
      headers['RT-UDDOKTAPAY-API-KEY'] ||
      headers['Rt-Uddoktapay-Api-Key'] ||
      headers['http_rt_uddoktapay_api_key'] ||
      headers['HTTP_RT_UDDOKTAPAY_API_KEY'] ||
      ''
    ).toString().trim();

    if (!receivedApiKey) {
      this.logger.error('[UddoktaPay Webhook] Missing RT-UDDOKTAPAY-API-KEY header in webhook request');
      throw new ForbiddenException('Missing RT-UDDOKTAPAY-API-KEY authentication header');
    }

    const keyMatches =
      receivedApiKey.length === configuredApiKey.length &&
      timingSafeEqual(Buffer.from(receivedApiKey), Buffer.from(configuredApiKey));

    if (!keyMatches) {
      this.logger.error('[UddoktaPay Webhook] Authentication failed: RT-UDDOKTAPAY-API-KEY header mismatch');
      throw new ForbiddenException('Invalid RT-UDDOKTAPAY-API-KEY header: Webhook unauthorized');
    }

    // Step 2: Extract & validate payload fields
    const {
      invoice_id,
      amount,
      status,
      metadata,
      transaction_id,
      payment_method,
    } = payload;

    if (!invoice_id || amount === undefined || !status) {
      this.logger.error(`[UddoktaPay Webhook] Incomplete payload: ${JSON.stringify(payload)}`);
      throw new BadRequestException('Incomplete webhook payload: invoice_id, amount, and status are required');
    }

    const cleanInvoiceId = invoice_id.trim();
    const cleanStatus = status.trim().toUpperCase();
    const paymentAttemptId = metadata?.payment_attempt_id;
    const metadataOrderId = metadata?.order_id || metadata?.order_number;

    this.logger.log(
      `[UddoktaPay Webhook] Verified webhook for invoice: ${cleanInvoiceId}, status: ${cleanStatus}, amount: ${amount}, trx: ${transaction_id || 'N/A'}`,
    );

    // Step 3: Find Payment record
    let payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { providerInvoiceId: cleanInvoiceId },
          ...(paymentAttemptId ? [{ providerOrderId: paymentAttemptId }] : []),
          ...(metadataOrderId
            ? [
                { orderId: metadataOrderId },
                { order: { orderNumber: metadataOrderId } },
                { order: { orderNumber: `#${metadataOrderId}` } },
              ]
            : []),
        ],
      },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      this.logger.error(
        `[UddoktaPay Webhook] Payment record not found for invoice_id: ${cleanInvoiceId}, attempt: ${paymentAttemptId}`,
      );
      throw new NotFoundException(`Payment record not found for invoice_id: ${cleanInvoiceId}`);
    }

    // Step 4: Idempotency guard: If already PAID, return 200 OK without re-applying side effects
    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(
        `[UddoktaPay Webhook] Idempotent delivery: Payment ${payment.providerOrderId} already confirmed as PAID.`,
      );
      return {
        success: true,
        message: 'Payment was already verified and processed previously.',
        idempotent: true,
      };
    }

    // Step 5: Duplicate transaction reference check (if transaction_id present)
    if (transaction_id) {
      const duplicatePayment = await this.prisma.payment.findFirst({
        where: {
          providerTransactionId: transaction_id,
          id: { not: payment.id },
          status: PaymentStatus.PAID,
        },
      });
      if (duplicatePayment) {
        this.logger.error(
          `[UddoktaPay Webhook] Duplicate transaction ID rejected: ${transaction_id} already utilized for payment ${duplicatePayment.id}`,
        );
        throw new BadRequestException('Transaction ID has already been utilized for another payment');
      }

      const duplicateOrder = await this.prisma.order.findFirst({
        where: {
          paymentReference: transaction_id,
          id: { not: payment.orderId },
          paymentStatus: PaymentStatus.PAID,
        },
      });
      if (duplicateOrder) {
        this.logger.error(
          `[UddoktaPay Webhook] Duplicate transaction ID rejected: ${transaction_id} already utilized for order ${duplicateOrder.orderNumber}`,
        );
        throw new BadRequestException('Transaction ID has already been utilized for another order');
      }
    }

    // Step 6: Amount validation
    const expectedAmount = Number(payment.amount);
    const webhookAmount = Number(amount);
    if (Math.abs(webhookAmount - expectedAmount) > 0.01) {
      this.logger.error(
        `[UddoktaPay Webhook] Amount mismatch: Expected ৳${expectedAmount}, received ৳${webhookAmount} for payment ${payment.id}`,
      );
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: `Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`,
          providerInvoiceId: cleanInvoiceId,
          providerTransactionId: transaction_id || null,
          rawWebhookPayload: payload as any,
        },
      });
      throw new BadRequestException(`Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`);
    }

    // Step 7: Handle non-completed statuses
    const isExplicitFailure = ['FAILED', 'CANCELLED', 'DECLINED', 'REJECTED', 'EXPIRED', 'ERROR'].includes(
      cleanStatus,
    );
    if (isExplicitFailure) {
      this.logger.warn(`[UddoktaPay Webhook] Provider reported non-completed status: ${cleanStatus} for ${cleanInvoiceId}`);
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: `Gateway webhook reported status: ${cleanStatus}`,
          providerInvoiceId: cleanInvoiceId,
          providerTransactionId: transaction_id || null,
          rawWebhookPayload: payload as any,
        },
      });

      return {
        success: true,
        message: `Payment status updated to FAILED based on webhook status: ${cleanStatus}`,
      };
    }

    if (cleanStatus === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerInvoiceId: cleanInvoiceId,
          rawWebhookPayload: payload as any,
        },
      });
      return {
        success: true,
        message: 'Payment is pending resolution with gateway provider.',
      };
    }

    if (cleanStatus === 'COMPLETED') {
      const trxId = transaction_id || cleanInvoiceId;
      const channel = payment_method || 'UddoktaPay';

      await this.applySuccessfulPayment(payment, cleanInvoiceId, trxId, webhookAmount, payload, channel);

      return {
        success: true,
        message: 'Payment verified and settled successfully via UddoktaPay webhook.',
      };
    }

    return {
      success: true,
      message: `Webhook received with status: ${cleanStatus}`,
    };
  }

  /**
   * Applies verified payment success atomically in a Prisma database transaction.
   */
  private async applySuccessfulPayment(
    payment: any,
    invoiceId: string,
    transactionId: string,
    amount: number,
    rawPayload: any,
    channelName: string = 'UddoktaPay',
  ) {
    // If already marked PAID, return early (idempotent)
    if (payment.status === PaymentStatus.PAID) {
      return;
    }

    const order = payment.order;
    const now = new Date();

    let customerInvoiceNumber: string | undefined;

    await this.prisma.$transaction(
      async (tx) => {
      // 1. Update Payment attempt record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerInvoiceId: invoiceId,
          providerTransactionId: transactionId,
          paidAt: now,
          failureReason: null,
          rawWebhookPayload: rawPayload as any,
        },
      });

      // 2. Update Order status
      const updatedOrderData: Prisma.OrderUpdateInput = {
        paymentStatus: PaymentStatus.PAID,
        paidAmount: amount,
        paymentReference: transactionId,
      };

      if (order.status === OrderStatus.PENDING) {
        updatedOrderData.status = OrderStatus.CONFIRMED;
      }

      await tx.order.update({
        where: { id: order.id },
        data: updatedOrderData,
      });

      // 3. Atomically create or ensure Rongin Libas customer Invoice and link Payment
      if (this.invoicesService) {
        const invoice = await this.invoicesService.createInvoiceForOrderInTx(
          tx,
          order.id,
          payment.id,
        );
        customerInvoiceNumber = invoice.invoiceNumber;
      }

      // 4. Record order tracking event
      await tx.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status,
          description: `Payment of ৳${amount.toLocaleString()} verified and settled via UddoktaPay (${channelName}) [Gateway Invoice: ${invoiceId}${customerInvoiceNumber ? `, RL Invoice: ${customerInvoiceNumber}` : ''}, Trx: ${transactionId}]`,
          customerVisible: true,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });

    this.logger.log(
      `[UddoktaPay] Successfully settled payment for order ${order.orderNumber} (Gateway Invoice: ${invoiceId}${customerInvoiceNumber ? `, RL Invoice: ${customerInvoiceNumber}` : ''}, Trx: ${transactionId}, Amount: ৳${amount})`,
    );

    // Dispatch order confirmation notification after database settlement commits
    if (
      this.ordersService &&
      typeof this.ordersService.dispatchConfirmationNotificationForPaidOrder === 'function'
    ) {
      try {
        await this.ordersService.dispatchConfirmationNotificationForPaidOrder(payment.order.id);
      } catch (err: any) {
        this.logger.warn(
          `Failed to dispatch confirmation email after UddoktaPay payment for ${payment.order.orderNumber}: ${err.message}`,
        );
      }
    }

    // Report server-side verified purchase to Google Analytics 4 via Measurement Protocol
    if (this.ga4Service && typeof this.ga4Service.sendPurchaseEvent === 'function') {
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

    return { customerInvoiceNumber };
  }

  /**
   * Handles payment cancellation and safely releases reserved stock.
   */
  public async handleFailedPayment(
    orderId: string,
    reason: string = 'Payment cancelled or failed',
  ): Promise<{ success: boolean; message: string }> {
    if (this.ordersService && typeof this.ordersService.deleteUnpaidOrFailedOrder === 'function') {
      const res = await this.ordersService.deleteUnpaidOrFailedOrder(orderId, reason);
      return { success: true, message: res.message };
    }

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
          { payments: { some: { providerOrderId: orderId } } },
          { payments: { some: { providerInvoiceId: orderId } } },
        ],
      },
      include: { items: true },
    });

    if (!order) return { success: true, message: 'Order not found or already deleted' };
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { success: false, message: 'Cannot delete already paid order' };
    }

    await this.prisma.$transaction(async (tx) => {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stock: true },
          });
          if (variant) {
            await tx.productVariant.updateMany({
              where: { id: variant.id, stock: variant.stock },
              data: { stock: variant.stock + item.quantity },
            });
            await tx.inventoryTransaction.create({
              data: {
                variantId: variant.id,
                quantityChange: item.quantity,
                previousStock: variant.stock,
                newStock: variant.stock + item.quantity,
                type: 'RETURN',
                note: `${reason} for order #${order.orderNumber}`,
              },
            });
          }
        }
      }
      await tx.order.delete({ where: { id: order.id } });
    });

    return { success: true, message: 'Order deleted and stock released successfully' };
  }

  /**
   * Automatically polls UddoktaPay to verify and settle any pending online orders
   * created within the last 2 hours (120 minutes).
   * If a payment is confirmed as COMPLETED, it marks the order as CONFIRMED & PAID,
   * dispatches the order confirmation email with the official invoice attached,
   * and records a customer-visible tracking event.
   */
  public async reconcilePendingPayments(): Promise<{
    checked: number;
    settled: number;
    failed: number;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { checked: 0, settled: 0, failed: 0 };
    }

    // Look for pending orders with UddoktaPay from the last 2 hours (120 minutes)
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);

    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        provider: 'UDDOKTAPAY',
        status: PaymentStatus.PENDING,
        providerInvoiceId: { not: null },
        createdAt: { gte: twoHoursAgo },
        order: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      },
      include: {
        order: {
          include: { customer: true, items: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let checked = 0;
    let settled = 0;
    let failed = 0;

    for (const payment of pendingPayments) {
      checked++;
      try {
        const invoiceId = payment.providerInvoiceId;
        if (!invoiceId) continue;

        this.logger.log(
          `[UddoktaPay Auto-Reconciliation] Checking pending order ${payment.order.orderNumber} (Invoice: ${invoiceId})`,
        );

        const verifyRes = await this.verifyPayment(invoiceId, payment.order.orderNumber);

        if (verifyRes.isPaid) {
          settled++;
          this.logger.log(
            `[UddoktaPay Auto-Reconciliation] Settled order ${payment.order.orderNumber} successfully. Confirmation email with invoice dispatched!`,
          );
        } else if (verifyRes.paymentStatus === PaymentStatus.FAILED) {
          failed++;
        }
      } catch (err: any) {
        this.logger.warn(
          `[UddoktaPay Auto-Reconciliation] Check error for order ${payment.order.orderNumber}: ${err.message}`,
        );
      }
    }

    return { checked, settled, failed };
  }

  /**
   * Performs full or partial refund via UddoktaPay API (POST /api/refund-payment).
   * Safe: Uses UDDOKTAPAY_BASE_URL and UDDOKTAPAY_API_KEY from environment.
   */
  public async refundPayment(
    invoiceId: string,
    amount?: number,
    reason?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('UddoktaPay API key is not configured.');
    }
    if (!invoiceId || typeof invoiceId !== 'string') {
      throw new BadRequestException('Valid invoice_id is required to process refund.');
    }

    const cleanInvoiceId = invoiceId.trim();
    const refundEndpoint = this.getApiEndpoint('refund-payment');

    this.logger.log(
      `[UddoktaPay ${this.getEnvironment().toUpperCase()}] Requesting refund for invoice: ${cleanInvoiceId}, amount: ${amount ?? 'full'}`,
    );

    const payload: Record<string, any> = { invoice_id: cleanInvoiceId };
    if (amount !== undefined && amount > 0) {
      payload.amount = amount;
    }
    if (reason) {
      payload.reason = reason;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(refundEndpoint, {
        method: 'POST',
        headers: {
          'RT-UDDOKTAPAY-API-KEY': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const resData: any = await response.json().catch(() => null);

      if (!response.ok || !resData || resData.status === false) {
        this.logger.error(
          `[UddoktaPay Refund] Upstream refund request failed (HTTP ${response.status}): ${JSON.stringify(
            resData,
          )}`,
        );
        throw new BadRequestException(
          resData?.message || 'UddoktaPay refund request was declined by gateway.',
        );
      }

      // Update database records
      const payment = await this.prisma.payment.findFirst({
        where: { providerInvoiceId: cleanInvoiceId },
        include: { order: true },
      });

      if (payment) {
        await this.prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.REFUNDED,
              failureReason: reason ? `Refunded: ${reason}` : 'Refunded via UddoktaPay gateway',
            },
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: PaymentStatus.REFUNDED,
              status: OrderStatus.REFUNDED,
            },
          });

          await tx.orderTrackingEvent.create({
            data: {
              orderId: payment.orderId,
              status: OrderStatus.REFUNDED,
              description: `Payment refunded via UddoktaPay (${this.getEnvironment()}) [Invoice: ${cleanInvoiceId}, Amount: ৳${amount || payment.amount}]`,
              customerVisible: true,
            },
          });
        });
      }

      return {
        success: true,
        message: resData?.message || 'Payment refunded successfully.',
        data: resData,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof ServiceUnavailableException) throw err;
      this.logger.error(`[UddoktaPay Refund] Network exception: ${err?.message || err}`);
      throw new ServiceUnavailableException('UddoktaPay refund API is temporarily unreachable.');
    }
  }
}

