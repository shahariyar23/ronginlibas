import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  CourierBalanceResult,
  CourierHealthResult,
  CourierProvider,
  CourierReturnResult,
  CreateShipmentInput,
  CreateShipmentResult,
  ShipmentStatusResult,
} from '../interfaces/courier-provider.interface.js';
import {
  COURIER_STEADFAST,
  STEADFAST_TRACKING_BASE_URL,
} from '../constants/courier.constants.js';
import { normalizeSteadfastStatus } from '../status/steadfast-status.mapper.js';

interface MockConsignmentRecord {
  consignmentId: string;
  trackingCode: string;
  providerInvoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  status: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MockSteadfastCourierProvider implements CourierProvider {
  readonly name = COURIER_STEADFAST;
  private readonly logger = new Logger(MockSteadfastCourierProvider.name);

  // In-memory store of mock consignments
  private readonly store = new Map<string, MockConsignmentRecord>();
  private readonly invoiceIndex = new Map<string, string>(); // invoice -> consignmentId
  private readonly trackingIndex = new Map<string, string>(); // trackingCode -> consignmentId

  private mockCounter = 5000;
  private mockBalance = 24850.00;

  constructor() {
    this.seedFixtures();
  }

  /**
   * Seed deterministic fixtures for reliable testing and demos.
   */
  private seedFixtures(): void {
    const fixtures: Array<{
      consignmentId: string;
      trackingCode: string;
      invoice: string;
      status: string;
      codAmount: number;
    }> = [
      {
        consignmentId: '1001',
        trackingCode: 'ST1001',
        invoice: 'RL-INV-2026-000001',
        status: 'in_review',
        codAmount: 1850,
      },
      {
        consignmentId: '1002',
        trackingCode: 'ST1002',
        invoice: 'RL-INV-2026-000002',
        status: 'pending',
        codAmount: 2400,
      },
      {
        consignmentId: '1003',
        trackingCode: 'ST1003',
        invoice: 'RL-INV-2026-000003',
        status: 'in_transit',
        codAmount: 3200,
      },
      {
        consignmentId: '1004',
        trackingCode: 'ST1004',
        invoice: 'RL-INV-2026-000004',
        status: 'out_for_delivery',
        codAmount: 1500,
      },
      {
        consignmentId: '1005',
        trackingCode: 'ST1005',
        invoice: 'RL-INV-2026-000005',
        status: 'delivered',
        codAmount: 0,
      },
      {
        consignmentId: '1006',
        trackingCode: 'ST1006',
        invoice: 'RL-INV-2026-000006',
        status: 'partial_delivered',
        codAmount: 1200,
      },
      {
        consignmentId: '1007',
        trackingCode: 'ST1007',
        invoice: 'RL-INV-2026-000007',
        status: 'hold',
        codAmount: 2100,
      },
      {
        consignmentId: '1008',
        trackingCode: 'ST1008',
        invoice: 'RL-INV-2026-000008',
        status: 'cancelled',
        codAmount: 900,
      },
      {
        consignmentId: '1009',
        trackingCode: 'ST1009',
        invoice: 'RL-INV-2026-000009',
        status: 'unknown_custom_status',
        codAmount: 1500,
      },
    ];

    for (const f of fixtures) {
      const record: MockConsignmentRecord = {
        consignmentId: f.consignmentId,
        trackingCode: f.trackingCode,
        providerInvoice: f.invoice,
        recipientName: 'Valued Atelier Patron',
        recipientPhone: '01700000000',
        recipientAddress: 'House 1, Road 2, Gulshan-2, Dhaka',
        codAmount: f.codAmount,
        status: f.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.store.set(f.consignmentId, record);
      this.invoiceIndex.set(f.invoice, f.consignmentId);
      this.trackingIndex.set(f.trackingCode, f.consignmentId);
    }
  }

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    this.logger.log(
      `[Mock Steadfast] Simulating shipment creation for Order ${input.orderNumber} (Invoice: ${input.invoiceNumber})`,
    );

    // Simulate error scenarios for testing
    if (input.invoiceNumber.includes('FAIL')) {
      throw new BadRequestException('Mock Steadfast Error: Simulated address validation failure');
    }
    if (input.invoiceNumber.includes('TIMEOUT')) {
      throw new GatewayTimeoutException('Mock Steadfast Error: Simulated upstream network timeout');
    }

    // Check if duplicate invoice already registered in mock
    const existingCid = this.invoiceIndex.get(input.invoiceNumber);
    if (existingCid) {
      const existing = this.store.get(existingCid)!;
      return {
        consignmentId: existing.consignmentId,
        trackingCode: existing.trackingCode,
        providerInvoice: existing.providerInvoice,
        status: normalizeSteadfastStatus(existing.status),
        providerStatus: existing.status,
        codAmount: existing.codAmount,
        trackingUrl: `${STEADFAST_TRACKING_BASE_URL}/${existing.trackingCode}`,
        rawResponse: { mock: true, duplicateDetected: true, ...existing },
      };
    }

    this.mockCounter += 1;
    const consignmentId = String(this.mockCounter);
    const trackingCode = `ST${consignmentId}`;
    const initialStatus = 'in_review';

    const record: MockConsignmentRecord = {
      consignmentId,
      trackingCode,
      providerInvoice: input.invoiceNumber,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      recipientAddress: input.recipientAddress,
      codAmount: input.codAmount,
      status: initialStatus,
      note: input.note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.store.set(consignmentId, record);
    this.invoiceIndex.set(input.invoiceNumber, consignmentId);
    this.trackingIndex.set(trackingCode, consignmentId);

    const trackingUrl = `${STEADFAST_TRACKING_BASE_URL}/${trackingCode}`;

    return {
      consignmentId,
      trackingCode,
      providerInvoice: input.invoiceNumber,
      status: normalizeSteadfastStatus(initialStatus),
      providerStatus: initialStatus,
      codAmount: input.codAmount,
      deliveryCharge: 80,
      trackingUrl,
      rawResponse: {
        status: 200,
        message: 'Order created successfully (Mock Mode)',
        consignment: {
          consignment_id: consignmentId,
          invoice: input.invoiceNumber,
          tracking_code: trackingCode,
          recipient_name: input.recipientName,
          recipient_phone: input.recipientPhone,
          recipient_address: input.recipientAddress,
          cod_amount: input.codAmount,
          status: initialStatus,
          note: input.note,
        },
      },
    };
  }

  async getStatusByConsignmentId(consignmentId: string | number): Promise<ShipmentStatusResult> {
    const id = String(consignmentId);
    const record = this.store.get(id);
    const rawStatus = record ? record.status : 'in_review';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      consignmentId: id,
      trackingCode: record?.trackingCode || `ST${id}`,
      providerInvoice: record?.providerInvoice,
      status: normalized,
      providerStatus: rawStatus,
      codAmount: record?.codAmount,
      deliveryCharge: 80,
      rawResponse: {
        status: 200,
        delivery_status: rawStatus,
        mock: true,
      },
    };
  }

  async getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult> {
    const cid = this.invoiceIndex.get(invoice);
    const record = cid ? this.store.get(cid) : null;
    const rawStatus = record ? record.status : 'in_review';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      consignmentId: record?.consignmentId || cid,
      trackingCode: record?.trackingCode,
      providerInvoice: invoice,
      status: normalized,
      providerStatus: rawStatus,
      codAmount: record?.codAmount,
      rawResponse: {
        status: 200,
        delivery_status: rawStatus,
        mock: true,
      },
    };
  }

  async getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult> {
    const cid = this.trackingIndex.get(trackingCode);
    const record = cid ? this.store.get(cid) : null;
    const rawStatus = record ? record.status : 'in_review';
    const normalized = normalizeSteadfastStatus(rawStatus);

    return {
      consignmentId: record?.consignmentId || cid,
      trackingCode,
      providerInvoice: record?.providerInvoice,
      status: normalized,
      providerStatus: rawStatus,
      codAmount: record?.codAmount,
      rawResponse: {
        status: 200,
        delivery_status: rawStatus,
        mock: true,
      },
    };
  }

  async getBalance(): Promise<CourierBalanceResult> {
    return {
      currentBalance: this.mockBalance,
      currency: 'BDT',
      rawResponse: {
        status: 200,
        current_balance: this.mockBalance,
        mock: true,
      },
    };
  }

  async createReturnRequest(
    consignmentId: string | number,
    reason?: string,
  ): Promise<CourierReturnResult> {
    const id = String(consignmentId);
    const record = this.store.get(id);

    if (reason && reason.includes('REJECT')) {
      return {
        success: false,
        message: 'Mock Steadfast: Return window expired or parcel ineligible for return',
        consignmentId: id,
        rawResponse: { mock: true, status: 400 },
      };
    }

    if (record) {
      record.status = 'return';
      record.updatedAt = new Date();
    }

    return {
      success: true,
      message: 'Return request booked successfully in mock mode',
      consignmentId: id,
      rawResponse: { mock: true, status: 200 },
    };
  }

  async healthCheck(): Promise<CourierHealthResult> {
    return {
      enabled: true,
      mode: 'mock',
      provider: this.name,
      configured: true,
      connected: true,
      message: 'Mock Steadfast provider is operational (simulation mode active)',
      baseUrl: 'mock://steadfast.local',
      details: {
        seededConsignments: this.store.size,
        simulatedBalance: this.mockBalance,
      },
    };
  }

  /**
   * Test helper to set status for a consignment in mock mode.
   */
  setMockStatus(consignmentId: string, status: string): void {
    const record = this.store.get(consignmentId);
    if (record) {
      record.status = status;
      record.updatedAt = new Date();
    } else {
      this.store.set(consignmentId, {
        consignmentId,
        trackingCode: `ST${consignmentId}`,
        providerInvoice: `INV-MOCK-${consignmentId}`,
        recipientName: 'Test Patron',
        recipientPhone: '01700000000',
        recipientAddress: 'Test Address',
        codAmount: 1000,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}
