import { Injectable, Logger } from '@nestjs/common';
import {
  CourierBalanceResult,
  CourierHealthResult,
  CourierProvider,
  CourierReturnResult,
  CreateShipmentInput,
  CreateShipmentResult,
  ShipmentStatusResult,
} from '../interfaces/courier-provider.interface.js';
import { SteadfastApiClient } from '../client/steadfast-api.client.js';
import {
  COURIER_STEADFAST,
  STEADFAST_TRACKING_BASE_URL,
} from '../constants/courier.constants.js';
import { normalizeSteadfastStatus } from '../status/steadfast-status.mapper.js';

@Injectable()
export class SteadfastCourierProvider implements CourierProvider {
  readonly name = COURIER_STEADFAST;
  private readonly logger = new Logger(SteadfastCourierProvider.name);

  constructor(private readonly client: SteadfastApiClient) {}

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    this.logger.log(
      `[Steadfast Live] Creating shipment for Order ${input.orderNumber} (Invoice: ${input.invoiceNumber}, COD: ৳${input.codAmount})`,
    );

    const res = await this.client.createOrder({
      invoice: input.invoiceNumber,
      recipient_name: input.recipientName,
      recipient_phone: input.recipientPhone,
      recipient_address: input.recipientAddress,
      cod_amount: input.codAmount,
      note: input.note,
    });

    const consignment = res.consignment;
    if (!consignment) {
      throw new Error(res.message || 'Steadfast response did not contain consignment details');
    }

    const rawStatus = consignment.status || 'in_review';
    const normalizedStatus = normalizeSteadfastStatus(rawStatus);
    const trackingCode = consignment.tracking_code || String(consignment.consignment_id);
    const trackingUrl = `${STEADFAST_TRACKING_BASE_URL}/${encodeURIComponent(trackingCode)}`;

    return {
      consignmentId: String(consignment.consignment_id),
      trackingCode,
      providerInvoice: consignment.invoice || input.invoiceNumber,
      status: normalizedStatus,
      providerStatus: rawStatus,
      codAmount: Number(consignment.cod_amount ?? input.codAmount),
      trackingUrl,
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async getStatusByConsignmentId(consignmentId: string | number): Promise<ShipmentStatusResult> {
    const res = await this.client.getStatusByCid(consignmentId);
    const rawStatus = res.delivery_status || 'unknown';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      consignmentId: String(consignmentId),
      status: normalized,
      providerStatus: rawStatus,
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult> {
    const res = await this.client.getStatusByInvoice(invoice);
    const rawStatus = res.delivery_status || 'unknown';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      providerInvoice: invoice,
      status: normalized,
      providerStatus: rawStatus,
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult> {
    const res = await this.client.getStatusByTrackingCode(trackingCode);
    const rawStatus = res.delivery_status || 'unknown';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      trackingCode,
      status: normalized,
      providerStatus: rawStatus,
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async getBalance(): Promise<CourierBalanceResult> {
    const res = await this.client.getBalance();
    return {
      currentBalance: Number(res.current_balance || 0),
      currency: 'BDT',
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async createReturnRequest(
    consignmentId: string | number,
    reason?: string,
  ): Promise<CourierReturnResult> {
    const res = await this.client.createReturnRequest(consignmentId, reason);
    return {
      success: res.status === 200,
      message: res.message || 'Return request processed',
      consignmentId: String(consignmentId),
      rawResponse: res as unknown as Record<string, unknown>,
    };
  }

  async healthCheck(): Promise<CourierHealthResult> {
    const configured = this.client.isConfigured();
    let connected = false;
    let message = 'Steadfast Live provider configured';

    if (!configured) {
      return {
        enabled: true,
        mode: 'live',
        provider: this.name,
        configured: false,
        connected: false,
        baseUrl: this.client.getBaseUrl(),
        message: 'Steadfast Live mode is enabled, but API_KEY or SECRET_KEY is missing.',
      };
    }

    try {
      await this.client.getBalance();
      connected = true;
      message = 'Connected to Steadfast Live API successfully';
    } catch (err: any) {
      connected = false;
      message = `Failed to connect to Steadfast Live API: ${err.message}`;
    }

    return {
      enabled: true,
      mode: 'live',
      provider: this.name,
      configured,
      connected,
      baseUrl: this.client.getBaseUrl(),
      message,
    };
  }
}
