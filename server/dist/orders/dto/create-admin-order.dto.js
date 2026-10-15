var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsArray, ValidateNested, IsInt, Min, IsOptional, IsEnum, IsObject, IsEmail, MaxLength, IsNumber, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
export class CreateAdminOrderCustomerDto {
    fullName;
    firstName;
    lastName;
    phone;
    phoneNumber;
    email;
}
__decorate([
    ApiPropertyOptional({ example: 'Mostak Shahariyar' }),
    IsString(),
    IsOptional(),
    MaxLength(120),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mostak' }),
    IsString(),
    IsOptional(),
    MaxLength(60),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "firstName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Shahariyar' }),
    IsString(),
    IsOptional(),
    MaxLength(60),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "phoneNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: 'customer@example.com' }),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderCustomerDto.prototype, "email", void 0);
export class CreateAdminOrderItemDto {
    productId;
    variantId;
    productVariantId;
    quantity;
}
__decorate([
    ApiPropertyOptional({ example: 'product-id' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderItemDto.prototype, "productId", void 0);
__decorate([
    ApiPropertyOptional({ example: 'variant-id' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderItemDto.prototype, "variantId", void 0);
__decorate([
    ApiPropertyOptional({ example: 'variant-id' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderItemDto.prototype, "productVariantId", void 0);
__decorate([
    ApiProperty({ example: 1, minimum: 1 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateAdminOrderItemDto.prototype, "quantity", void 0);
export class CreateAdminOrderAddressDto {
    addressLine1;
    addressLine2;
    streetAddress;
    city;
    district;
    thana;
    area;
    division;
    postalCode;
    phone;
    receiverPhone;
    fullName;
    receiverName;
    email;
    deliveryInstructions;
    notes;
}
__decorate([
    ApiPropertyOptional({ example: 'House 42, Road 11' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "addressLine1", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "addressLine2", void 0);
__decorate([
    ApiPropertyOptional({ example: 'House 42, Road 11' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "streetAddress", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Dhaka' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "city", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Dhaka' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "district", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mirpur' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "thana", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mirpur' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "area", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Dhaka' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "division", void 0);
__decorate([
    ApiPropertyOptional({ example: '1216' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "postalCode", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: '01916664011' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "receiverPhone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mostak Shahariyar' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Mostak Shahariyar' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "receiverName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'customer@example.com' }),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderAddressDto.prototype, "notes", void 0);
export class CreateAdminOrderDto {
    customerId;
    customer;
    newCustomer;
    addressId;
    shippingAddress;
    items;
    couponCode;
    manualDiscountType;
    manualDiscountValue;
    deliveryCharge;
    paymentMethod = 'COD';
    paymentStatus = 'PENDING';
    paymentReference;
    paidAmount;
    courierName;
    courierProvider;
    shippingMethod;
    orderStatus = OrderStatus.PENDING;
    source = 'ADMIN';
    customerNotes;
    adminNotes;
}
__decorate([
    ApiPropertyOptional({ description: 'ID of an existing registered customer' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "customerId", void 0);
__decorate([
    ApiPropertyOptional({ type: CreateAdminOrderCustomerDto, description: 'Details for walk-in or new customer' }),
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => CreateAdminOrderCustomerDto),
    __metadata("design:type", CreateAdminOrderCustomerDto)
], CreateAdminOrderDto.prototype, "customer", void 0);
__decorate([
    ApiPropertyOptional({ type: CreateAdminOrderCustomerDto, description: 'Details for walk-in or new customer' }),
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => CreateAdminOrderCustomerDto),
    __metadata("design:type", CreateAdminOrderCustomerDto)
], CreateAdminOrderDto.prototype, "newCustomer", void 0);
__decorate([
    ApiPropertyOptional({ description: 'ID of an existing saved address for this customer' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "addressId", void 0);
__decorate([
    ApiPropertyOptional({ type: CreateAdminOrderAddressDto }),
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => CreateAdminOrderAddressDto),
    __metadata("design:type", CreateAdminOrderAddressDto)
], CreateAdminOrderDto.prototype, "shippingAddress", void 0);
__decorate([
    ApiProperty({ type: [CreateAdminOrderItemDto] }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => CreateAdminOrderItemDto),
    __metadata("design:type", Array)
], CreateAdminOrderDto.prototype, "items", void 0);
__decorate([
    ApiPropertyOptional({ example: 'EID2026' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "couponCode", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['FIXED', 'PERCENTAGE'] }),
    IsEnum(['FIXED', 'PERCENTAGE']),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "manualDiscountType", void 0);
__decorate([
    ApiPropertyOptional({ example: 200 }),
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateAdminOrderDto.prototype, "manualDiscountValue", void 0);
__decorate([
    ApiPropertyOptional({ example: 100 }),
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateAdminOrderDto.prototype, "deliveryCharge", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['COD', 'BKASH', 'NAGAD', 'CARD', 'WAITMARK_PAY', 'UDDOKTAPAY'], default: 'COD' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' }),
    IsEnum(['UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED']),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "paymentStatus", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Transaction ID or payment reference note' }),
    IsString(),
    MaxLength(255),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "paymentReference", void 0);
__decorate([
    ApiPropertyOptional({ example: 500 }),
    IsNumber(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], CreateAdminOrderDto.prototype, "paidAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Steadfast Courier' }),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "courierName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Steadfast' }),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "courierProvider", void 0);
__decorate([
    ApiPropertyOptional({ example: 'STANDARD' }),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "shippingMethod", void 0);
__decorate([
    ApiPropertyOptional({ enum: OrderStatus, default: OrderStatus.PENDING }),
    IsEnum(OrderStatus),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "orderStatus", void 0);
__decorate([
    ApiPropertyOptional({ example: 'ADMIN', default: 'ADMIN' }),
    IsString(),
    MaxLength(50),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "source", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(1000),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "customerNotes", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(1000),
    IsOptional(),
    __metadata("design:type", String)
], CreateAdminOrderDto.prototype, "adminNotes", void 0);
//# sourceMappingURL=create-admin-order.dto.js.map