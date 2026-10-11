var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType, OfferDiscountType } from '@prisma/client';
export class CreateOfferDto {
    name;
    slug;
    description;
    bannerTitle;
    bannerSubtitle;
    bannerMessage;
    offerType;
    discountType;
    discountValue;
    startDate;
    expiryDate;
    isActive;
    badgeText;
    couponCode;
    priority;
    productIds;
    categoryIds;
    collectionIds;
}
__decorate([
    ApiProperty({ example: 'Eid Collection Special Markdown' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'eid-collection-special' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Exclusive festive offers across handcrafted panjabis' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Special Offers' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "bannerTitle", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Save more on selected Rongin Libas styles.' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "bannerSubtitle", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Up to 30% OFF' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "bannerMessage", void 0);
__decorate([
    ApiPropertyOptional({ enum: OfferType, default: OfferType.PRODUCT_DISCOUNT }),
    IsEnum(OfferType),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "offerType", void 0);
__decorate([
    ApiProperty({ enum: OfferDiscountType, default: OfferDiscountType.PERCENTAGE }),
    IsEnum(OfferDiscountType),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "discountType", void 0);
__decorate([
    ApiProperty({ example: 20 }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "discountValue", void 0);
__decorate([
    ApiProperty({ example: '2026-10-11T00:00:00.000Z' }),
    IsDateString(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "startDate", void 0);
__decorate([
    ApiProperty({ example: '2026-10-31T23:59:59.999Z' }),
    IsDateString(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "expiryDate", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateOfferDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({ example: 'EXCLUSIVE DEAL' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "badgeText", void 0);
__decorate([
    ApiPropertyOptional({ example: 'BESPOKE1000' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "couponCode", void 0);
__decorate([
    ApiPropertyOptional({ default: 0 }),
    IsInt(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "priority", void 0);
__decorate([
    ApiPropertyOptional({ type: [String], description: 'Product IDs to attach to offer' }),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "productIds", void 0);
__decorate([
    ApiPropertyOptional({ type: [String], description: 'Category IDs to attach to offer' }),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "categoryIds", void 0);
__decorate([
    ApiPropertyOptional({ type: [String], description: 'Collection IDs to attach to offer' }),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "collectionIds", void 0);
//# sourceMappingURL=create-offer.dto.js.map