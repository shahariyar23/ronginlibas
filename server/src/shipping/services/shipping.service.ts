import { Injectable } from '@nestjs/common';

export interface CourierProvider {
  createShipment(orderId: string, details: any): Promise<any>;
  trackShipment(consignmentId: string): Promise<any>;
}

@Injectable()
export class ShippingService {
  // Prepared abstraction for Phase 2 Steadfast and Pathao logistics integrations
  async getDeliveryZones() {
    return [
      { id: 'dhaka-metro', name: 'Dhaka Metropolitan', charge: 80, tat: '24-48 Hours' },
      { id: 'nationwide', name: 'Outside Dhaka (64 Districts)', charge: 150, tat: '72 Hours' },
    ];
  }
}
