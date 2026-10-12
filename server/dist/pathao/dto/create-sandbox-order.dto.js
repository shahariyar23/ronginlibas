var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateSandboxOrderDto {
    store_id;
    merchant_order_id;
    recipient_name;
    recipient_phone;
    recipient_address;
    recipient_city;
    recipient_zone;
    recipient_area;
    delivery_type = 48;
    item_type = 2;
    special_instruction;
    item_quantity = 1;
    item_weight;
    amount_to_collect;
    item_description;
}
__decorate([
    ApiPropertyOptional({ description: 'Merchant store ID', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "store_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Merchant order reference', example: '#RL1001' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "merchant_order_id", void 0);
__decorate([
    ApiProperty({ description: 'Recipient customer name', example: 'Farhana Ahmed' }),
    IsString(),
    IsNotEmpty({ message: 'Recipient name cannot be empty' }),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "recipient_name", void 0);
__decorate([
    ApiProperty({ description: '11-digit Bangladesh mobile number', example: '01712088866' }),
    IsString(),
    IsNotEmpty({ message: 'Recipient phone number is required' }),
    Matches(/^(?:\+88|88)?01[3-9]\d{8}$/, {
        message: 'Recipient phone must be a valid 11-digit Bangladeshi mobile number (e.g., 017xxxxxxxx)',
    }),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "recipient_phone", void 0);
__decorate([
    ApiProperty({ description: 'Full physical delivery address with street and area', example: 'House 14, Road 5, Block C, Banani' }),
    IsString(),
    IsNotEmpty({ message: 'Recipient address cannot be empty' }),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "recipient_address", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination city ID', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "recipient_city", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination zone ID', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "recipient_zone", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Destination area ID', example: 1 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "recipient_area", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Delivery type: 48 = Normal, 12 = On Demand', default: 48 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "delivery_type", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Item type: 1 = Document, 2 = Parcel', default: 2 }),
    IsOptional(),
    IsNumber(),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "item_type", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Special delivery instructions', example: 'Fragile luxury garment - deliver by afternoon' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "special_instruction", void 0);
__decorate([
    ApiProperty({ description: 'Total item quantity in consignment', example: 1 }),
    IsNumber(),
    Min(1, { message: 'Item quantity must be at least 1' }),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "item_quantity", void 0);
__decorate([
    ApiProperty({ description: 'Weight in KG (e.g. 0.5)', example: 0.5 }),
    IsNotEmpty({ message: 'Item weight is required' }),
    __metadata("design:type", Object)
], CreateSandboxOrderDto.prototype, "item_weight", void 0);
__decorate([
    ApiProperty({ description: 'COD amount to collect in BDT (0 if prepaid)', example: 1500 }),
    IsNumber(),
    Min(0, { message: 'Amount to collect cannot be negative' }),
    Type(() => Number),
    __metadata("design:type", Number)
], CreateSandboxOrderDto.prototype, "amount_to_collect", void 0);
__decorate([
    ApiProperty({ description: 'Brief item description', example: 'Silk Festive Panjabi & Kurti' }),
    IsString(),
    IsNotEmpty({ message: 'Item description is required' }),
    __metadata("design:type", String)
], CreateSandboxOrderDto.prototype, "item_description", void 0);
//# sourceMappingURL=create-sandbox-order.dto.js.map