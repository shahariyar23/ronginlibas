var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    defaultSettings = {
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
        const settingsMap = { ...this.defaultSettings };
        for (const record of records) {
            try {
                settingsMap[record.key] = JSON.parse(record.value);
            }
            catch {
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
    async updateSettings(dto) {
        const entries = Object.entries(dto);
        await this.prisma.$transaction(entries
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => {
            const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return this.prisma.storeSetting.upsert({
                where: { key },
                update: { value: stringified },
                create: { key, value: stringified, group: 'store' },
            });
        }));
        return this.getSettings();
    }
};
SettingsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], SettingsService);
export { SettingsService };
//# sourceMappingURL=settings.service.js.map