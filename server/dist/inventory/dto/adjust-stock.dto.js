var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class AdjustStockDto {
    variantId;
    quantityChange;
    type = 'RESTOCK';
    note;
    reason;
}
__decorate([
    ApiProperty({ example: 'variant-uuid-or-id' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ example: 10, description: 'Positive to add stock, negative to reduce' }),
    IsInt(),
    __metadata("design:type", Number)
], AdjustStockDto.prototype, "quantityChange", void 0);
__decorate([
    ApiPropertyOptional({
        enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK'],
        default: 'RESTOCK',
    }),
    IsEnum(['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK']),
    IsOptional(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Atelier loom batch restock - Dhaka unit' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "note", void 0);
__decorate([
    ApiPropertyOptional({
        enum: [
            'RESTOCK',
            'SALE',
            'RETURN',
            'EXCHANGE',
            'DAMAGED',
            'LOST',
            'MANUAL_ADJUSTMENT',
            'ORDER_CANCELLED',
        ],
        example: 'RESTOCK',
    }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "reason", void 0);
//# sourceMappingURL=adjust-stock.dto.js.map