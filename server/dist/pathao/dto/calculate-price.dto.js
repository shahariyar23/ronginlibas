var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CalculatePriceDto {
    store_id;
    item_type = 2;
    delivery_type = 48;
    item_weight;
    recipient_city;
    recipient_zone;
}
__decorate([
    ApiPropertyOptional({ description: 'Merchant store ID', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "store_id", void 0);
__decorate([
    ApiPropertyOptional({ description: '1 for Document, 2 for Parcel', default: 2 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "item_type", void 0);
__decorate([
    ApiPropertyOptional({ description: '48 for Normal Delivery, 12 for On Demand', default: 48 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "delivery_type", void 0);
__decorate([
    ApiProperty({ description: 'Package weight in KG', example: 0.5 }),
    IsNumber(),
    Min(0.1),
    Max(50),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "item_weight", void 0);
__decorate([
    ApiProperty({ description: 'Destination City ID from Pathao', example: 1 }),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "recipient_city", void 0);
__decorate([
    ApiProperty({ description: 'Destination Zone ID from Pathao', example: 1 }),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "recipient_zone", void 0);
//# sourceMappingURL=calculate-price.dto.js.map