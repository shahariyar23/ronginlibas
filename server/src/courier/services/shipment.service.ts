import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoicesService } from '../../orders/services/invoices.service.js';
import { COURIER_PROVIDER } from '../constants/courier.constants.js';
import type {
  CourierBalanceResult,
  CourierHealthResult,
  CourierProvider,
  CourierReturnResult,
  ShipmentStatusResult,
} from '../interfaces/courier-provider.interface.js';
import { CreateShipmentDto } from '../dto/create-shipment.dto.js';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto.js';
import { SteadfastWebhookDto } from '../dto/steadfast-webhook.dto.js';
import {
  normalizeSteadfastStatus,
  getCustomerSafeShipmentStatus,
} from '../status/steadfast-status.mapper.js';
import {
  OrderStatus,
  PaymentStatus,
  Shipment,
  ShipmentEvent,
  ShipmentStatus,
} from '@prisma/client';
import type { AdminAuditActor } from '../../audit/audit.service.js';

export interface NormalizedShipmentDetails {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  consignmentId: string | null;
  trackingCode: string | null;
  providerInvoice: string | null;
  status: ShipmentStatus;
  providerStatus: string | null;
  customerSafeStatus: string;
  codAmount: number;
  deliveryCharge: number;
  trackingUrl: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientAddress: string | null;
  note: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  events?: ShipmentEvent[];
}

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly invoicesService: InvoicesService,
    @Inject(COURIER_PROVIDER)
    private readonly courierProvider: CourierProvider,
  ) {}

  /**
   * Returns active provider name and operational mode.
   */
  getProviderInfo() {
    return {
      provider: this.courierProvider.name,
      mode: (this.configService.get<string>('STEADFAST_MODE') || 'mock').toLowerCase(),
    };
  }

  /**
   * Health check for courier integration.
   */
  async healthCheck(): Promise<CourierHealthResult> {
    return this.courierProvider.healthCheck();
  }

  /**
   * Retrieve current courier merchant balance.
   */
  async getBalance(): Promise<CourierBalanceResult> {
    return this.courierProvider.getBalance();
  }

  /**
   * Creates a shipment with the configured courier provider for an existing order.
   * Enforces authoritative COD calculation and strict duplicate consignment prevention.
   */
  async createShipmentForOrder(
    orderId: string,
    dto?: CreateShipmentDto,
    actor?: AdminAuditActor,
  ): Promise<NormalizedShipmentDetails> {
    this.logger.log(`[Shipment] Booking shipment for order ${orderId} (Actor: ${actor?.email || 'System'})`);

    // 1. Fetch order with items, customer, and payments
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    // 2. Validate order state
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot create shipment for cancelled order ${order.orderNumber}.`);
    }
    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(`Cannot create shipment for refunded order ${order.orderNumber}.`);
    }

    // 3. Idempotency Check / Duplicate Consignment Protection
    const existingShipment = await this.prisma.shipment.findFirst({
      where: {
        orderId: order.id,
        consignmentId: { not: null },
        status: { not: ShipmentStatus.CANCELLED },
      },
      include: { events: true },
    });

    if (existingShipment) {
      this.logger.warn(
        `[Shipment] Duplicate consignment booking prevented for order ${order.orderNumber}. Existing CID: #${existingShipment.consignmentId}`,
      );
      throw new ConflictException(
        `A shipment has already been booked with ${existingShipment.provider} for order ${order.orderNumber} (Consignment #${existingShipment.consignmentId}, Tracking: ${existingShipment.trackingCode}).`,
      );
    }

    // 4. Resolve recipient information
    const shipping = (order.shippingAddress as Record<string, any>) || {};

    const recipientName =
      (typeof shipping.fullName === 'string' && shipping.fullName.trim()) ||
      (typeof shipping.recipient === 'string' && shipping.recipient.trim()) ||
      (typeof shipping.name === 'string' && shipping.name.trim()) ||
      order.guestName ||
      (order.customer
        ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
        : 'Valued Patron');

    const recipientPhone =
      (typeof shipping.phone === 'string' && shipping.phone.trim()) ||
      order.guestPhone ||
      order.customer?.phone ||
      '';

    if (!recipientPhone || recipientPhone.length < 8) {
      throw new BadRequestException(
        `Order ${order.orderNumber} does not have a valid recipient contact phone number. Please update shipping phone before booking courier.`,
      );
    }

    const formattedAddressParts = [
      shipping.addressLine1 || shipping.address,
      shipping.addressLine2,
      shipping.area,
      shipping.city,
      shipping.division,
      shipping.postalCode,
    ]
      .filter(Boolean)
      .map((s: string) => String(s).trim());

    const recipientAddress =
      formattedAddressParts.join(', ') || 'Dhaka Metropolitan, Bangladesh';

    // 5. Authoritative Server-side COD calculation
    let codAmount = 0;
    if (order.paymentStatus === PaymentStatus.PAID) {
      codAmount = 0;
    } else {
      const total = Number(order.totalAmount);
      const paid = Number(order.paidAmount || 0);
      codAmount = Math.max(0, Math.round(total - paid));
    }

    // 6. Ensure or obtain authoritative Tax Invoice
    const invoice = await this.invoicesService.getOrCreateInvoiceForOrder(order.id);
    const invoiceNumber = invoice.invoiceNumber || order.orderNumber;

    // 7. Call Courier Provider
    const result = await this.courierProvider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceNumber,
      recipientName,
      recipientPhone,
      recipientAddress,
      codAmount,
      note: dto?.note,
    });

    const normalizedStatus = (result.status as ShipmentStatus) || ShipmentStatus.IN_REVIEW;

    // 8. Persist Shipment and initial ShipmentEvent atomically in Database
    const shipment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.shipment.create({
        data: {
          orderId: order.id,
          provider: this.courierProvider.name,
          consignmentId: result.consignmentId,
          trackingCode: result.trackingCode,
          providerInvoice: result.providerInvoice,
          status: normalizedStatus,
          providerStatus: result.providerStatus,
          codAmount: result.codAmount,
          deliveryCharge: result.deliveryCharge ?? 0,
          trackingUrl: result.trackingUrl,
          recipientName,
          recipientPhone,
          recipientAddress,
          note: dto?.note,
          metadata: (result.rawResponse as any) || undefined,
          lastSyncedAt: new Date(),
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: created.id,
          eventType: 'CREATED',
          status: normalizedStatus,
          message: `Consignment created with ${this.courierProvider.name} (CID: #${result.consignmentId})`,
          source: actor ? 'ADMIN' : 'SYSTEM',
          payload: (result.rawResponse as any) || undefined,
        },
      });

      // Synchronize Order courier snapshot fields for instant customer & admin visibility
      const orderUpdates: Record<string, any> = {
        courierName: 'Steadfast Courier',
        courierProvider: this.courierProvider.name,
        courierConsignmentId: result.consignmentId,
        trackingNumber: result.trackingCode,
        trackingUrl: result.trackingUrl,
        courierStatus: normalizedStatus,
        courierStatusRaw: result.providerStatus,
        courierLastSyncedAt: new Date(),
      };

      // Automatically advance Order status to SHIPPED if currently in CONFIRMED, PROCESSING, or PACKED
      if (
        order.status === OrderStatus.CONFIRMED ||
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.PACKED
      ) {
        orderUpdates.status = OrderStatus.SHIPPED;
      }

      await tx.order.update({
        where: { id: order.id },
        data: orderUpdates,
      });

      return created;
    });

    this.logger.log(
      `[Shipment] Successfully booked shipment ${shipment.id} for Order ${order.orderNumber} (CID: #${shipment.consignmentId}, Tracking: ${shipment.trackingCode})`,
    );

    return this.mapToNormalizedDetails(shipment, order.orderNumber);
  }

  /**
   * Retrieves shipment details and event audit history for an order.
   */
  async getShipmentByOrderId(orderId: string): Promise<NormalizedShipmentDetails | null> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { orderId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: { orderNumber: true },
        },
      },
    });

    if (!shipment) return null;
    return this.mapToNormalizedDetails(shipment, shipment.order.orderNumber);
  }

  /**
   * Refreshes status from courier gateway and synchronizes local records.
   */
  async refreshShipmentStatus(
    orderId: string,
    actor?: AdminAuditActor,
  ): Promise<NormalizedShipmentDetails> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { orderId },
      include: {
        order: true,
      },
    });

    if (!shipment || !shipment.consignmentId) {
      throw new NotFoundException(`No active shipment consignment found for order ${orderId}.`);
    }

    // Call Provider to fetch live status
    const statusResult = await this.courierProvider.getStatusByConsignmentId(shipment.consignmentId);
    const newNormalizedStatus = (statusResult.status as ShipmentStatus) || ShipmentStatus.UNKNOWN;

    // Transactional status update
    const updated = await this.prisma.$transaction(async (tx) => {
      const savedShipment = await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: newNormalizedStatus,
          providerStatus: statusResult.providerStatus,
          lastSyncedAt: new Date(),
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          eventType: 'STATUS_SYNC',
          status: newNormalizedStatus,
          message: `Synced with ${this.courierProvider.name}: ${statusResult.providerStatus} (${newNormalizedStatus})`,
          source: actor ? 'ADMIN' : 'SYNC_POLL',
          payload: (statusResult.rawResponse as any) || undefined,
        },
      });

      // Update Order courier cache
      const orderUpdates: Record<string, any> = {
        courierStatus: newNormalizedStatus,
        courierStatusRaw: statusResult.providerStatus,
        courierLastSyncedAt: new Date(),
      };

      // Lifecycle automation rules
      if (newNormalizedStatus === ShipmentStatus.DELIVERED) {
        if (shipment.order.status !== OrderStatus.DELIVERED) {
          orderUpdates.status = OrderStatus.DELIVERED;
        }
        if (
          shipment.order.paymentMethod === 'COD' &&
          shipment.order.paymentStatus === PaymentStatus.PENDING
        ) {
          orderUpdates.paymentStatus = PaymentStatus.PAID;
          orderUpdates.paidAmount = shipment.order.totalAmount;
        }
      }

      await tx.order.update({
        where: { id: shipment.orderId },
        data: orderUpdates,
      });

      return savedShipment;
    });

    return this.mapToNormalizedDetails(updated, shipment.order.orderNumber);
  }

  /**
   * Looks up consignment status by Consignment ID (CID).
   */
  async getStatusByConsignmentId(cid: string): Promise<ShipmentStatusResult> {
    return this.courierProvider.getStatusByConsignmentId(cid);
  }

  /**
   * Looks up consignment status by Provider Invoice.
   */
  async getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult> {
    return this.courierProvider.getStatusByInvoice(invoice);
  }

  /**
   * Looks up consignment status by Tracking Code.
   */
  async getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult> {
    return this.courierProvider.getStatusByTrackingCode(trackingCode);
  }

  /**
   * Creates a return request for a booked consignment.
   */
  async createReturnRequest(
    orderId: string,
    dto?: CreateReturnRequestDto,
    actor?: AdminAuditActor,
  ): Promise<CourierReturnResult> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { orderId },
      include: { order: true },
    });

    if (!shipment || !shipment.consignmentId) {
      throw new NotFoundException(`No active shipment found for order ${orderId}.`);
    }

    const res = await this.courierProvider.createReturnRequest(
      shipment.consignmentId,
      dto?.reason,
    );

    if (res.success) {
      await this.prisma.$transaction(async (tx) => {
        await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            status: ShipmentStatus.RETURNED,
            providerStatus: 'return_requested',
            lastSyncedAt: new Date(),
          },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            eventType: 'RETURN_REQUESTED',
            status: ShipmentStatus.RETURNED,
            message: `Return request booked: ${dto?.reason || 'Initiated by admin'}`,
            source: actor ? 'ADMIN' : 'SYSTEM',
            payload: (res.rawResponse as any) || undefined,
          },
        });

        await tx.order.update({
          where: { id: shipment.orderId },
          data: {
            status: OrderStatus.RETURN_REQUESTED,
            courierStatus: ShipmentStatus.RETURNED,
            courierStatusRaw: 'return_requested',
            courierLastSyncedAt: new Date(),
          },
        });
      });
    }

    return res;
  }

  /**
   * Processes incoming webhook notification from Steadfast.
   * Ensures signature/secret validation, strict payload parsing, and idempotent execution.
   */
  async processWebhook(
    payload: SteadfastWebhookDto,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Steadfast Webhook] Incoming webhook notification received`);

    // 1. Webhook Secret / Signature Validation
    const configuredSecret = this.configService.get<string>('STEADFAST_WEBHOOK_SECRET');
    if (configuredSecret) {
      const incomingSecret =
        (headers['x-steadfast-signature'] as string) ||
        (headers['x-webhook-secret'] as string) ||
        (headers['x-api-key'] as string) ||
        '';

      if (!incomingSecret || incomingSecret !== configuredSecret) {
        this.logger.warn(`[Steadfast Webhook] Unauthorized webhook attempt: Secret mismatch.`);
        throw new UnauthorizedException('Invalid or missing webhook signature/secret.');
      }
    }

    // 2. Extract Consignment Identifiers
    const rawCid = payload.consignment_id != null ? String(payload.consignment_id).trim() : '';
    const rawInvoice = payload.invoice ? String(payload.invoice).trim() : '';
    const rawTracking = payload.tracking_code ? String(payload.tracking_code).trim() : '';
    const rawStatus = (payload.status || payload.delivery_status || '').trim();

    if (!rawCid && !rawInvoice && !rawTracking) {
      this.logger.warn('[Steadfast Webhook] Rejected: Webhook payload missing consignment identifiers');
      throw new BadRequestException('Webhook payload missing consignment_id, invoice, or tracking_code');
    }

    // 3. Locate Shipment in Database
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        OR: [
          rawCid ? { consignmentId: rawCid } : undefined,
          rawInvoice ? { providerInvoice: rawInvoice } : undefined,
          rawTracking ? { trackingCode: rawTracking } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        order: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!shipment) {
      this.logger.warn(
        `[Steadfast Webhook] Shipment not found for CID: "${rawCid}", Invoice: "${rawInvoice}", Tracking: "${rawTracking}"`,
      );
      return {
        success: false,
        message: 'Consignment not found in Rongin Libas system',
      };
    }

    const normalizedStatus = normalizeSteadfastStatus(rawStatus);

    // 4. Idempotency Check: Don't execute side-effects if status already matches latest recorded event
    const lastEvent = shipment.events?.[0];
    if (
      lastEvent &&
      lastEvent.eventType === 'WEBHOOK_RECEIVED' &&
      lastEvent.status === normalizedStatus
    ) {
      this.logger.log(
        `[Steadfast Webhook] Idempotent delivery: Event ${normalizedStatus} already recorded for shipment ${shipment.id}`,
      );
      return {
        success: true,
        message: 'Idempotent delivery: Status already up to date',
      };
    }

    // 5. Update Database within Transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: normalizedStatus,
          providerStatus: rawStatus,
          lastSyncedAt: new Date(),
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          eventType: 'WEBHOOK_RECEIVED',
          status: normalizedStatus,
          message: `Webhook event: ${rawStatus} (${normalizedStatus})`,
          source: 'WEBHOOK',
          payload: payload as any,
        },
      });

      const orderUpdates: Record<string, any> = {
        courierStatus: normalizedStatus,
        courierStatusRaw: rawStatus,
        courierLastSyncedAt: new Date(),
      };

      // Controlled business rule execution
      if (normalizedStatus === ShipmentStatus.DELIVERED) {
        if (shipment.order.status !== OrderStatus.DELIVERED) {
          orderUpdates.status = OrderStatus.DELIVERED;
        }
        if (
          shipment.order.paymentMethod === 'COD' &&
          shipment.order.paymentStatus === PaymentStatus.PENDING
        ) {
          orderUpdates.paymentStatus = PaymentStatus.PAID;
          orderUpdates.paidAmount = shipment.order.totalAmount;
        }
      }

      await tx.order.update({
        where: { id: shipment.orderId },
        data: orderUpdates,
      });
    });

    this.logger.log(
      `[Steadfast Webhook] Successfully processed webhook for Order ${shipment.order.orderNumber} -> ${normalizedStatus}`,
    );

    return {
      success: true,
      message: `Webhook processed: ${normalizedStatus}`,
    };
  }

  /**
   * Helper mapper to return normalized details.
   */
  private mapToNormalizedDetails(
    shipment: Shipment & { events?: ShipmentEvent[] },
    orderNumber: string,
  ): NormalizedShipmentDetails {
    return {
      id: shipment.id,
      orderId: shipment.orderId,
      orderNumber,
      provider: shipment.provider,
      consignmentId: shipment.consignmentId,
      trackingCode: shipment.trackingCode,
      providerInvoice: shipment.providerInvoice,
      status: shipment.status,
      providerStatus: shipment.providerStatus,
      customerSafeStatus: getCustomerSafeShipmentStatus(shipment.status),
      codAmount: Number(shipment.codAmount),
      deliveryCharge: Number(shipment.deliveryCharge),
      trackingUrl: shipment.trackingUrl,
      recipientName: shipment.recipientName,
      recipientPhone: shipment.recipientPhone,
      recipientAddress: shipment.recipientAddress,
      note: shipment.note,
      lastSyncedAt: shipment.lastSyncedAt,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
      events: shipment.events,
    };
  }
}
