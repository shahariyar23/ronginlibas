var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, IsOptional, IsEnum, IsObject, IsEmail, MaxLength, Matches, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateOrderItemDto {
    productId;
    variantId;
    quantity;
}
__decorate([
    ApiProperty({ example: 'product-id' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "productId", void 0);
__decorate([
    ApiProperty({ example: 'variant-id' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ example: 1, minimum: 1 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateOrderItemDto.prototype, "quantity", void 0);
export class ShippingAddressDto {
    addressLine1;
    addressLine2;
    city;
    division;
    phone;
    fullName;
    email;
    area;
    postalCode;
    deliveryInstructions;
}
__decorate([
    ApiProperty({ example: 'House 42, Road 11, Block D' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "addressLine1", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "addressLine2", void 0);
__decorate([
    ApiProperty({ example: 'Gulshan-2' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "city", void 0);
__decorate([
    ApiProperty({ example: 'Dhaka' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "division", void 0);
__decorate([
    ApiProperty({ example: '01711234567' }),
    IsString(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    IsNotEmpty(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional(),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "area", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "postalCode", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(500),
    IsOptional(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "deliveryInstructions", void 0);
export class CreateOrderDto {
    items;
    shippingAddress;
    paymentMethod = 'COD';
    couponCode;
    customerNotes;
    guestName;
    guestEmail;
    customTailoringNote;
}
__decorate([
    ApiProperty({ type: [CreateOrderItemDto] }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => CreateOrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    ApiProperty({ type: ShippingAddressDto }),
    IsObject(),
    ValidateNested(),
    Type(() => ShippingAddressDto),
    __metadata("design:type", ShippingAddressDto)
], CreateOrderDto.prototype, "shippingAddress", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['COD', 'BKASH', 'NAGAD', 'CARD'], default: 'COD' }),
    IsEnum(['COD', 'BKASH', 'NAGAD', 'CARD']),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    ApiPropertyOptional({ example: 'EID2026' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "couponCode", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(1000),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerNotes", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Required for guest checkout; ignored when authenticated' }),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "guestName", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Required for guest checkout' }),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "guestEmail", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(1000),
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customTailoringNote", void 0);
//# sourceMappingURL=create-order.dto.js.map