import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/services/settings.service.js';

export interface CourierProvider {
  createShipment(orderNumber: string, details: Record<string, unknown>): Promise<unknown>;
  trackShipment(consignmentId: string): Promise<unknown>;
}

@Injectable()
export class ShippingService {
  constructor(private readonly settingsService: SettingsService) {}

  async getDeliveryZones() {
    const settings = await this.settingsService.getPublicSettings();
    return [
      {
        id: 'dhaka-metro',
        name: 'Dhaka Metropolitan',
        charge: settings.dhakaDeliveryCharge,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
      },
      {
        id: 'nationwide',
        name: 'Bangladesh-wide',
        charge: settings.outsideDhakaDeliveryCharge,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
      },
    ];
  }
}
