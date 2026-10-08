import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateSettingsDto } from '../dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSettings = {
    storeName: 'Rongin Libas',
    logo: '/logo.svg',
    phone: '01916664011',
    whatsapp: '01916664011',
    email: 'concierge@ronginlibas.com',
    website: 'https://ronginlibas.com',
    facebook: 'https://facebook.com/ronginlibas.bd',
    instagram: null,
    promotionalAnnouncement: null,
    businessHours: null,
    currency: 'BDT',
    currencySymbol: '৳',
    dhakaDeliveryCharge: 80,
    outsideDhakaDeliveryCharge: 150,
    freeShippingEnabled: true,
    freeDeliveryThreshold: 3000,
    promoEnabled: false,
    promoCode: '',
    promoDiscountText: '',
    whatsappOrderEnabled: true,
    codEnabled: true,
    bkashEnabled: false,
    nagadEnabled: false,
    cardEnabled: false,
    storeStatus: 'ACTIVE',
  };

  async getSettings() {
    const records = await this.prisma.storeSetting.findMany();
    if (records.length === 0) {
      return this.defaultSettings;
    }

    const settingsMap: Record<string, unknown> = { ...this.defaultSettings };
    for (const record of records) {
      try {
        settingsMap[record.key] = JSON.parse(record.value) as unknown;
      } catch {
        settingsMap[record.key] = record.value;
      }
    }
    return settingsMap;
  }

  async getPublicSettings() {
    const all = await this.getSettings();
    return {
      storeName: all.storeName,
      logo: all.logo,
      phone: all.phone,
      whatsapp: all.whatsapp,
      email: all.email,
      website: all.website,
      facebook: all.facebook,
      instagram: all.instagram,
      currency: all.currency,
      currencySymbol: all.currencySymbol,
      dhakaDeliveryCharge: all.dhakaDeliveryCharge,
      outsideDhakaDeliveryCharge: all.outsideDhakaDeliveryCharge,
      freeShippingEnabled: all.freeShippingEnabled,
      freeDeliveryThreshold: all.freeDeliveryThreshold,
      promoEnabled: all.promoEnabled,
      promoCode: all.promoCode,
      promoDiscountText: all.promoDiscountText,
      whatsappOrderEnabled: all.whatsappOrderEnabled,
      codEnabled: all.codEnabled,
      bkashEnabled: all.bkashEnabled,
      nagadEnabled: all.nagadEnabled,
      cardEnabled: all.cardEnabled,
      promotionalAnnouncement: all.promotionalAnnouncement,
      businessHours: all.businessHours,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const entries = Object.entries(dto);
    await this.prisma.$transaction(
      entries
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
          const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return this.prisma.storeSetting.upsert({
            where: { key },
            update: { value: stringified },
            create: { key, value: stringified, group: 'store' },
          });
        }),
    );
    return this.getSettings();
  }
}
