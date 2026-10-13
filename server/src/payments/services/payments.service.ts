import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../../orders/services/orders.service.js';
import { WaitmarkPaymentService } from './waitmark-payment.service.js';

export interface PaymentGatewayProvider {
  initiatePayment(orderNumber: string, amount: number): Promise<{ redirectUrl: string }>;
  verifyPayment(transactionId: string): Promise<{ verified: boolean }>;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly waitmarkService: WaitmarkPaymentService,
  ) {}

  async getAvailableMethods() {
    const waitmarkConfigured = this.waitmarkService.isConfigured();
    const bkashConfigured = Boolean(
      this.configService.get<string>('BKASH_APP_KEY') &&
        this.configService.get<string>('BKASH_APP_SECRET'),
    );
    const nagadConfigured = Boolean(
      this.configService.get<string>('NAGAD_MERCHANT_ID') &&
        this.configService.get<string>('NAGAD_MERCHANT_PRIVATE_KEY'),
    );
    const sslCommerzConfigured = Boolean(
      this.configService.get<string>('SSLCOMMERZ_STORE_ID') &&
        this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD'),
    );
    return [
      { id: 'COD', name: 'Cash on Delivery', isEnabled: true },
      {
        id: 'WAITMARK_PAY',
        name: 'Waitmark Pay (Cards, Mobile Banking & Wallets)',
        isEnabled: waitmarkConfigured,
        credentialsConfigured: waitmarkConfigured,
      },
      {
        id: 'BKASH',
        name: 'bKash Direct',
        isEnabled: false,
        credentialsConfigured: bkashConfigured,
      },
      {
        id: 'NAGAD',
        name: 'Nagad Direct',
        isEnabled: false,
        credentialsConfigured: nagadConfigured,
      },
      {
        id: 'CARD',
        name: 'Debit/Credit Card',
        isEnabled: false,
        credentialsConfigured: sslCommerzConfigured,
      },
    ];
  }

  async createPayment(
    orderNumber: string,
    provider: 'BKASH' | 'NAGAD' | 'CARD',
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    const order = await this.ordersService.findOrderForAccess(
      orderNumber,
      customerId,
      phone,
      trackingToken,
    );
    if (order.paymentMethod !== provider) {
      throw new ServiceUnavailableException('Payment method cannot be changed after order placement');
    }
    const methods = await this.getAvailableMethods();
    if (!methods.find((method) => method.id === provider)?.isEnabled) {
      throw new ServiceUnavailableException(
        `${provider} payment initiation is unavailable until a verified provider adapter is installed`,
      );
    }
    throw new ServiceUnavailableException(
      `${provider} payment provider adapter is not installed; no payment was initiated`,
    );
  }

  async verifyPayment() {
    throw new ServiceUnavailableException(
      'Payment verification is unavailable until a gateway provider is configured',
    );
  }

  async handleWebhook() {
    throw new ServiceUnavailableException(
      'Payment webhooks are unavailable until a signed gateway provider is configured',
    );
  }
}
