var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateSettingsDto {
    storeName;
    phone;
    whatsapp;
    email;
    website;
    facebook;
    dhakaDeliveryCharge;
    outsideDhakaDeliveryCharge;
    freeDeliveryThreshold;
    freeShippingEnabled;
    promoEnabled;
    promoCode;
    promoDiscountText;
    whatsappOrderEnabled;
    codEnabled;
    bkashEnabled;
    bkashWallet;
    nagadEnabled;
    nagadWallet;
    currency;
}
__decorate([
    ApiPropertyOptional({ example: 'Rongin Libas' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "storeName", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "whatsapp", void 0);
__decorate([
    ApiPropertyOptional({ example: 'concierge@ronginlibas.com' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://ronginlibas.com' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "website", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://facebook.com/ronginlibas.bd' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "facebook", void 0);
__decorate([
    ApiPropertyOptional({ example: 80 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "dhakaDeliveryCharge", void 0);
__decorate([
    ApiPropertyOptional({ example: 150 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "outsideDhakaDeliveryCharge", void 0);
__decorate([
    ApiPropertyOptional({ example: 3000 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "freeDeliveryThreshold", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "freeShippingEnabled", void 0);
__decorate([
    ApiPropertyOptional({ default: false }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "promoEnabled", void 0);
__decorate([
    ApiPropertyOptional({ example: 'RONGINLAUNCH' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "promoCode", void 0);
__decorate([
    ApiPropertyOptional({ example: '15% OFF' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "promoDiscountText", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "whatsappOrderEnabled", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "codEnabled", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "bkashEnabled", void 0);
__decorate([
    ApiPropertyOptional({ example: '01711223344' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "bkashWallet", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "nagadEnabled", void 0);
__decorate([
    ApiPropertyOptional({ example: '01822554499' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "nagadWallet", void 0);
__decorate([
    ApiPropertyOptional({ example: 'BDT' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "currency", void 0);
//# sourceMappingURL=update-settings.dto.js.map