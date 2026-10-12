var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class CreateParcelDto {
    store_id;
    special_instruction;
    item_weight;
    delivery_type;
    recipient_city;
    recipient_zone;
    recipient_area;
    forceDuplicate;
}
__decorate([
    ApiPropertyOptional({ description: 'Specific merchant store ID for pickup', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "store_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Special delivery note or instruction' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateParcelDto.prototype, "special_instruction", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Custom package weight in KG (defaults to calculated garment weight)', example: 0.8 }),
    IsOptional(),
    Min(0.1),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "item_weight", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Delivery type: 48 = Standard (default), 12 = On demand', default: 48 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "delivery_type", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination city ID if overriding automatic resolution' }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "recipient_city", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination zone ID if overriding automatic resolution' }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "recipient_zone", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination area ID if overriding automatic resolution' }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateParcelDto.prototype, "recipient_area", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Force booking another parcel even if order was previously booked in sandbox' }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateParcelDto.prototype, "forceDuplicate", void 0);
//# sourceMappingURL=create-parcel.dto.js.map