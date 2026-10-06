import { Injectable } from '@nestjs/common';

export interface PaymentGatewayProvider {
  initiatePayment(orderId: string, amount: number): Promise<any>;
  verifyPayment(transactionId: string): Promise<any>;
}

@Injectable()
export class PaymentsService {
  // Prepared abstraction for Phase 2 bKash, Nagad, and SSLCOMMERZ integrations
  async getAvailableMethods() {
    return [
      { id: 'COD', name: 'Cash on Delivery', isEnabled: true },
      { id: 'BKASH', name: 'bKash Merchant Gateway', isEnabled: true },
      { id: 'NAGAD', name: 'Nagad Merchant', isEnabled: true },
    ];
  }
}
