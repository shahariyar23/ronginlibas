var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ShipmentService_1;
import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoicesService } from '../../orders/services/invoices.service.js';
import { COURIER_PROVIDER } from '../constants/courier.constants.js';
import { normalizeSteadfastStatus, getCustomerSafeShipmentStatus, } from '../status/steadfast-status.mapper.js';
import { OrderStatus, PaymentStatus, ShipmentStatus, } from '@prisma/client';
let ShipmentService = ShipmentService_1 = class ShipmentService {
    prisma;
    configService;
    invoicesService;
    courierProvider;
    logger = new Logger(ShipmentService_1.name);
    constructor(prisma, configService, invoicesService, courierProvider) {
        this.prisma = prisma;
        this.configService = configService;
        this.invoicesService = invoicesService;
        this.courierProvider = courierProvider;
    }
    getProviderInfo() {
        return {
            provider: this.courierProvider.name,
            mode: (this.configService.get('STEADFAST_MODE') || 'mock').toLowerCase(),
        };
    }
    async healthCheck() {
        return this.courierProvider.healthCheck();
    }
    async getBalance() {
        return this.courierProvider.getBalance();
    }
    async createShipmentForOrder(orderId, dto, actor) {
        this.logger.log(`[Shipment] Booking shipment for order ${orderId} (Actor: ${actor?.email || 'System'})`);
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
        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException(`Cannot create shipment for cancelled order ${order.orderNumber}.`);
        }
        if (order.status === OrderStatus.REFUNDED) {
            throw new BadRequestException(`Cannot create shipment for refunded order ${order.orderNumber}.`);
        }
        const existingShipment = await this.prisma.shipment.findFirst({
            where: {
                orderId: order.id,
                consignmentId: { not: null },
                status: { not: ShipmentStatus.CANCELLED },
            },
            include: { events: true },
        });
        if (existingShipment) {
            this.logger.warn(`[Shipment] Duplicate consignment booking prevented for order ${order.orderNumber}. Existing CID: #${existingShipment.consignmentId}`);
            throw new ConflictException(`A shipment has already been booked with ${existingShipment.provider} for order ${order.orderNumber} (Consignment #${existingShipment.consignmentId}, Tracking: ${existingShipment.trackingCode}).`);
        }
        const shipping = order.shippingAddress || {};
        const recipientName = (typeof shipping.fullName === 'string' && shipping.fullName.trim()) ||
            (typeof shipping.recipient === 'string' && shipping.recipient.trim()) ||
            (typeof shipping.name === 'string' && shipping.name.trim()) ||
            order.guestName ||
            (order.customer
                ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                : 'Valued Patron');
        const recipientPhone = (typeof shipping.phone === 'string' && shipping.phone.trim()) ||
            order.guestPhone ||
            order.customer?.phone ||
            '';
        if (!recipientPhone || recipientPhone.length < 8) {
            throw new BadRequestException(`Order ${order.orderNumber} does not have a valid recipient contact phone number. Please update shipping phone before booking courier.`);
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
            .map((s) => String(s).trim());
        const recipientAddress = formattedAddressParts.join(', ') || 'Dhaka Metropolitan, Bangladesh';
        let codAmount = 0;
        if (order.paymentStatus === PaymentStatus.PAID) {
            codAmount = 0;
        }
        else {
            const total = Number(order.totalAmount);
            const paid = Number(order.paidAmount || 0);
            codAmount = Math.max(0, Math.round(total - paid));
        }
        const invoice = await this.invoicesService.getOrCreateInvoiceForOrder(order.id);
        const invoiceNumber = invoice.invoiceNumber || order.orderNumber;
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
        const normalizedStatus = result.status || ShipmentStatus.IN_REVIEW;
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
                    metadata: result.rawResponse || undefined,
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
                    payload: result.rawResponse || undefined,
                },
            });
            const orderUpdates = {
                courierName: 'Steadfast Courier',
                courierProvider: this.courierProvider.name,
                courierConsignmentId: result.consignmentId,
                trackingNumber: result.trackingCode,
                trackingUrl: result.trackingUrl,
                courierStatus: normalizedStatus,
                courierStatusRaw: result.providerStatus,
                courierLastSyncedAt: new Date(),
            };
            if (order.status === OrderStatus.CONFIRMED ||
                order.status === OrderStatus.PROCESSING ||
                order.status === OrderStatus.PACKED) {
                orderUpdates.status = OrderStatus.SHIPPED;
            }
            await tx.order.update({
                where: { id: order.id },
                data: orderUpdates,
            });
            return created;
        });
        this.logger.log(`[Shipment] Successfully booked shipment ${shipment.id} for Order ${order.orderNumber} (CID: #${shipment.consignmentId}, Tracking: ${shipment.trackingCode})`);
        return this.mapToNormalizedDetails(shipment, order.orderNumber);
    }
    async getShipmentByOrderId(orderId) {
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
        if (!shipment)
            return null;
        return this.mapToNormalizedDetails(shipment, shipment.order.orderNumber);
    }
    async refreshShipmentStatus(orderId, actor) {
        const shipment = await this.prisma.shipment.findFirst({
            where: { orderId },
            include: {
                order: true,
            },
        });
        if (!shipment || !shipment.consignmentId) {
            throw new NotFoundException(`No active shipment consignment found for order ${orderId}.`);
        }
        const statusResult = await this.courierProvider.getStatusByConsignmentId(shipment.consignmentId);
        const newNormalizedStatus = statusResult.status || ShipmentStatus.UNKNOWN;
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
                    payload: statusResult.rawResponse || undefined,
                },
            });
            const orderUpdates = {
                courierStatus: newNormalizedStatus,
                courierStatusRaw: statusResult.providerStatus,
                courierLastSyncedAt: new Date(),
            };
            if (newNormalizedStatus === ShipmentStatus.DELIVERED) {
                if (shipment.order.status !== OrderStatus.DELIVERED) {
                    orderUpdates.status = OrderStatus.DELIVERED;
                }
                if (shipment.order.paymentMethod === 'COD' &&
                    shipment.order.paymentStatus === PaymentStatus.PENDING) {
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
    async getStatusByConsignmentId(cid) {
        return this.courierProvider.getStatusByConsignmentId(cid);
    }
    async getStatusByInvoice(invoice) {
        return this.courierProvider.getStatusByInvoice(invoice);
    }
    async getStatusByTrackingCode(trackingCode) {
        return this.courierProvider.getStatusByTrackingCode(trackingCode);
    }
    async createReturnRequest(orderId, dto, actor) {
        const shipment = await this.prisma.shipment.findFirst({
            where: { orderId },
            include: { order: true },
        });
        if (!shipment || !shipment.consignmentId) {
            throw new NotFoundException(`No active shipment found for order ${orderId}.`);
        }
        const res = await this.courierProvider.createReturnRequest(shipment.consignmentId, dto?.reason);
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
                        payload: res.rawResponse || undefined,
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
    async processWebhook(payload, headers) {
        this.logger.log(`[Steadfast Webhook] Incoming webhook notification received`);
        const configuredSecret = this.configService.get('STEADFAST_WEBHOOK_SECRET');
        if (configuredSecret) {
            const incomingSecret = headers['x-steadfast-signature'] ||
                headers['x-webhook-secret'] ||
                headers['x-api-key'] ||
                '';
            if (!incomingSecret || incomingSecret !== configuredSecret) {
                this.logger.warn(`[Steadfast Webhook] Unauthorized webhook attempt: Secret mismatch.`);
                throw new UnauthorizedException('Invalid or missing webhook signature/secret.');
            }
        }
        const rawCid = payload.consignment_id != null ? String(payload.consignment_id).trim() : '';
        const rawInvoice = payload.invoice ? String(payload.invoice).trim() : '';
        const rawTracking = payload.tracking_code ? String(payload.tracking_code).trim() : '';
        const rawStatus = (payload.status || payload.delivery_status || '').trim();
        if (!rawCid && !rawInvoice && !rawTracking) {
            this.logger.warn('[Steadfast Webhook] Rejected: Webhook payload missing consignment identifiers');
            throw new BadRequestException('Webhook payload missing consignment_id, invoice, or tracking_code');
        }
        const shipment = await this.prisma.shipment.findFirst({
            where: {
                OR: [
                    rawCid ? { consignmentId: rawCid } : undefined,
                    rawInvoice ? { providerInvoice: rawInvoice } : undefined,
                    rawTracking ? { trackingCode: rawTracking } : undefined,
                ].filter(Boolean),
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
            this.logger.warn(`[Steadfast Webhook] Shipment not found for CID: "${rawCid}", Invoice: "${rawInvoice}", Tracking: "${rawTracking}"`);
            return {
                success: false,
                message: 'Consignment not found in Rongin Libas system',
            };
        }
        const normalizedStatus = normalizeSteadfastStatus(rawStatus);
        const lastEvent = shipment.events?.[0];
        if (lastEvent &&
            lastEvent.eventType === 'WEBHOOK_RECEIVED' &&
            lastEvent.status === normalizedStatus) {
            this.logger.log(`[Steadfast Webhook] Idempotent delivery: Event ${normalizedStatus} already recorded for shipment ${shipment.id}`);
            return {
                success: true,
                message: 'Idempotent delivery: Status already up to date',
            };
        }
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
                    payload: payload,
                },
            });
            const orderUpdates = {
                courierStatus: normalizedStatus,
                courierStatusRaw: rawStatus,
                courierLastSyncedAt: new Date(),
            };
            if (normalizedStatus === ShipmentStatus.DELIVERED) {
                if (shipment.order.status !== OrderStatus.DELIVERED) {
                    orderUpdates.status = OrderStatus.DELIVERED;
                }
                if (shipment.order.paymentMethod === 'COD' &&
                    shipment.order.paymentStatus === PaymentStatus.PENDING) {
                    orderUpdates.paymentStatus = PaymentStatus.PAID;
                    orderUpdates.paidAmount = shipment.order.totalAmount;
                }
            }
            await tx.order.update({
                where: { id: shipment.orderId },
                data: orderUpdates,
            });
        });
        this.logger.log(`[Steadfast Webhook] Successfully processed webhook for Order ${shipment.order.orderNumber} -> ${normalizedStatus}`);
        return {
            success: true,
            message: `Webhook processed: ${normalizedStatus}`,
        };
    }
    mapToNormalizedDetails(shipment, orderNumber) {
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
};
ShipmentService = ShipmentService_1 = __decorate([
    Injectable(),
    __param(3, Inject(COURIER_PROVIDER)),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService,
        InvoicesService, Object])
], ShipmentService);
export { ShipmentService };
//# sourceMappingURL=shipment.service.js.map