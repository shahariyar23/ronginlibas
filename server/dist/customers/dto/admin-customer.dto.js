var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export class CustomerQueryDto extends PaginationQueryDto {
    status;
}
__decorate([
    ApiPropertyOptional({
        description: 'Filter customers by status: all, active, banned, or archived',
        enum: ['all', 'active', 'banned', 'archived'],
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "status", void 0);
export class UpdateCustomerStatusDto {
    isActive;
    reason;
}
__decorate([
    ApiProperty({ description: 'Customer active state flag' }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateCustomerStatusDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Required explanation / reason from the shop administration when banning',
    }),
    ValidateIf((o) => o.isActive === false),
    IsNotEmpty({ message: 'A ban reason is required when setting customer status to inactive/banned' }),
    IsString(),
    __metadata("design:type", String)
], UpdateCustomerStatusDto.prototype, "reason", void 0);
export class PermanentDeleteCustomerDto {
    confirm;
    reason;
}
__decorate([
    ApiProperty({ description: 'Mandatory confirmation marker for irreversible customer deletion' }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], PermanentDeleteCustomerDto.prototype, "confirm", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Optional administrative deletion reason/note' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], PermanentDeleteCustomerDto.prototype, "reason", void 0);
//# sourceMappingURL=admin-customer.dto.js.map