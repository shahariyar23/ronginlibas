import { vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService public settings', () => {
  it('returns customer-facing announcement settings without payment credentials', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { key: 'freeDeliveryThreshold', value: '4000' },
      { key: 'promoEnabled', value: 'true' },
      { key: 'promoCode', value: '"ATELIER15"' },
      { key: 'promoDiscountText', value: '"15% OFF"' },
      { key: 'whatsappOrderEnabled', value: 'false' },
      { key: 'bkashWallet', value: '"01700000000"' },
    ]);
    const prisma = { storeSetting: { findMany } } as unknown as PrismaService;
    const service = new SettingsService(prisma);

    const result = await service.getPublicSettings();

    expect(result).toMatchObject({
      freeShippingEnabled: true,
      freeDeliveryThreshold: 4000,
      promoEnabled: true,
      promoCode: 'ATELIER15',
      promoDiscountText: '15% OFF',
      whatsappOrderEnabled: false,
    });
    expect(result).not.toHaveProperty('bkashWallet');
  });
});
