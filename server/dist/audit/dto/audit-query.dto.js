var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export class AuditQueryDto extends PaginationQueryDto {
    module;
    action;
    actorId;
    actor;
    from;
    to;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "module", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "action", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "actorId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "actor", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "from", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "to", void 0);
//# sourceMappingURL=audit-query.dto.js.map