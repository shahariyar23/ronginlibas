export interface CreateShipmentInput {
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface CreateShipmentResult {
  consignmentId: string;
  trackingCode: string;
  providerInvoice: string;
  status: string;
  providerStatus: string;
  codAmount: number;
  deliveryCharge?: number;
  trackingUrl?: string;
  rawResponse?: Record<string, unknown>;
}

export interface ShipmentStatusResult {
  consignmentId?: string;
  trackingCode?: string;
  providerInvoice?: string;
  status: string;
  providerStatus: string;
  deliveryCharge?: number;
  codAmount?: number;
  rawResponse?: Record<string, unknown>;
}

export interface CourierBalanceResult {
  currentBalance: number;
  currency?: string;
  rawResponse?: Record<string, unknown>;
}

export interface CourierReturnResult {
  success: boolean;
  message: string;
  consignmentId?: string;
  rawResponse?: Record<string, unknown>;
}

export interface CourierHealthResult {
  enabled: boolean;
  mode: 'mock' | 'live';
  provider: string;
  configured: boolean;
  connected: boolean;
  message: string;
  baseUrl?: string;
  details?: Record<string, unknown>;
}

export interface CourierProvider {
  readonly name: string;
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  getStatusByConsignmentId(consignmentId: string | number): Promise<ShipmentStatusResult>;
  getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult>;
  getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult>;
  getBalance(): Promise<CourierBalanceResult>;
  createReturnRequest(consignmentId: string | number, reason?: string): Promise<CourierReturnResult>;
  healthCheck(): Promise<CourierHealthResult>;
}
