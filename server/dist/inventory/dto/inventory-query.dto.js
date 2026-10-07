var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
var InventoryFilter;
(function (InventoryFilter) {
    InventoryFilter["LOW_STOCK"] = "LOW_STOCK";
    InventoryFilter["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    InventoryFilter["IN_STOCK"] = "IN_STOCK";
})(InventoryFilter || (InventoryFilter = {}));
export class InventoryQueryDto extends PaginationQueryDto {
    filter;
}
__decorate([
    ApiPropertyOptional({ enum: InventoryFilter }),
    IsEnum(InventoryFilter),
    IsOptional(),
    __metadata("design:type", String)
], InventoryQueryDto.prototype, "filter", void 0);
//# sourceMappingURL=inventory-query.dto.js.map