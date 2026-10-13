var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsArray, IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, MaxLength, Min, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
export const ALLOWED_EVENT_TYPES = [
    'page_view',
    'view_item_list',
    'select_item',
    'view_item',
    'select_size',
    'select_color',
    'add_to_cart',
    'remove_from_cart',
    'view_cart',
    'begin_checkout',
    'add_shipping_info',
    'add_payment_info',
    'purchase',
    'search',
    'sign_up',
    'login',
    'add_to_wishlist',
    'remove_from_wishlist',
    'view_promotion',
    'select_promotion',
];
export class TrackEventDto {
    eventType;
    pagePath;
    productId;
    engagementDuration;
    campaignSource;
    campaignMedium;
    campaignName;
    properties;
}
__decorate([
    IsString(),
    IsIn(ALLOWED_EVENT_TYPES, {
        message: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`,
    }),
    __metadata("design:type", String)
], TrackEventDto.prototype, "eventType", void 0);
__decorate([
    IsString(),
    MaxLength(500),
    __metadata("design:type", String)
], TrackEventDto.prototype, "pagePath", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], TrackEventDto.prototype, "productId", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], TrackEventDto.prototype, "engagementDuration", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], TrackEventDto.prototype, "campaignSource", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], TrackEventDto.prototype, "campaignMedium", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], TrackEventDto.prototype, "campaignName", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    __metadata("design:type", Object)
], TrackEventDto.prototype, "properties", void 0);
export class TrackEventsBatchDto {
    events;
    referrer;
    deviceType;
}
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => TrackEventDto),
    __metadata("design:type", Array)
], TrackEventsBatchDto.prototype, "events", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], TrackEventsBatchDto.prototype, "referrer", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(50),
    __metadata("design:type", String)
], TrackEventsBatchDto.prototype, "deviceType", void 0);
export class UpdateConsentDto {
    analyticsConsent;
    marketingConsent;
    version;
}
__decorate([
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateConsentDto.prototype, "analyticsConsent", void 0);
__decorate([
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateConsentDto.prototype, "marketingConsent", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(20),
    __metadata("design:type", String)
], UpdateConsentDto.prototype, "version", void 0);
export class AnalyticsQueryDto {
    from;
    to;
    period;
    page = 1;
    limit = 20;
    search;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "from", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "to", void 0);
__decorate([
    IsOptional(),
    IsString(),
    IsIn(['today', '7d', '30d', '90d', 'year', 'all']),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "period", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], AnalyticsQueryDto.prototype, "page", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], AnalyticsQueryDto.prototype, "limit", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "search", void 0);
//# sourceMappingURL=track-event.dto.js.map