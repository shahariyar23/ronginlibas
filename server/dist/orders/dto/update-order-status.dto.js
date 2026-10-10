var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
export class UpdateOrderStatusDto {
    status;
    adminNotes;
    courierName;
    trackingNumber;
    trackingUrl;
    estimatedDelivery;
    shippingAddress;
}
__decorate([
    ApiPropertyOptional({
        enum: [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'PACKED',
            'SHIPPED',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
            'RETURN_REQUESTED',
            'RETURNED',
            'REFUNDED',
        ],
    }),
    IsEnum(OrderStatus),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Dispatched with Steadfast Courier #SF89234' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "adminNotes", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Steadfast Courier' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "courierName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'SF89234' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "trackingNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://steadfast.com.bd/track/SF89234' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "trackingUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: '2026-10-15T00:00:00.000Z' }),
    IsDateString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "estimatedDelivery", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Updated shipping address details' }),
    IsObject(),
    IsOptional(),
    __metadata("design:type", Object)
], UpdateOrderStatusDto.prototype, "shippingAddress", void 0);
//# sourceMappingURL=update-order-status.dto.js.map