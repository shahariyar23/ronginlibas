var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
export class OrderQueryDto extends PaginationQueryDto {
    status;
    paymentMethod;
    paymentStatus;
}
__decorate([
    ApiPropertyOptional(),
    IsIn([...Object.values(OrderStatus), 'ALL']),
    IsOptional(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional(),
    IsIn([...Object.values(PaymentMethod), 'ALL']),
    IsOptional(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "paymentMethod", void 0);
__decorate([
    ApiPropertyOptional(),
    IsIn(Object.values(PaymentStatus)),
    IsOptional(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "paymentStatus", void 0);
//# sourceMappingURL=order-query.dto.js.map