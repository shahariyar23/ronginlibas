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
    currency: 'BDT',
    currencySymbol: '৳',
    dhakaDeliveryCharge: 80,
    outsideDhakaDeliveryCharge: 150,
    freeDeliveryThreshold: 3000,
    codEnabled: true,
    bkashEnabled: true,
    bkashWallet: '01711-223344',
    nagadEnabled: true,
    nagadWallet: '01822-554499',
    storeStatus: 'ACTIVE',
  };

  async getSettings() {
    try {
      const records = await this.prisma.storeSetting.findMany();
      if (!records || records.length === 0) {
        return this.defaultSettings;
      }

      const settingsMap: Record<string, any> = { ...this.defaultSettings };
      for (const record of records) {
        try {
          settingsMap[record.key] = JSON.parse(record.value);
        } catch {
          settingsMap[record.key] = record.value;
        }
      }
      return settingsMap;
    } catch {
      return this.defaultSettings;
    }
  }

  async getPublicSettings() {
    const all = await this.getSettings();
    return {
      storeName: all.storeName,
      logo: all.logo,
      phone: all.phone,
      whatsapp: all.whatsapp,
      currency: all.currency,
      currencySymbol: all.currencySymbol,
      dhakaDeliveryCharge: all.dhakaDeliveryCharge,
      outsideDhakaDeliveryCharge: all.outsideDhakaDeliveryCharge,
      freeDeliveryThreshold: all.freeDeliveryThreshold,
      codEnabled: all.codEnabled,
      bkashEnabled: all.bkashEnabled,
      nagadEnabled: all.nagadEnabled,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    try {
      const entries = Object.entries(dto);
      for (const [key, value] of entries) {
        if (value !== undefined) {
          const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
          await this.prisma.storeSetting.upsert({
            where: { key },
            update: { value: stringified },
            create: { key, value: stringified, group: 'store' },
          });
        }
      }
      return await this.getSettings();
    } catch {
      return { ...this.defaultSettings, ...(dto as unknown as Record<string, unknown>) };
    }
  }
}
