var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export var ReportsPeriod;
(function (ReportsPeriod) {
    ReportsPeriod["SEVEN_DAYS"] = "7d";
    ReportsPeriod["THIRTY_DAYS"] = "30d";
    ReportsPeriod["NINETY_DAYS"] = "90d";
    ReportsPeriod["ONE_YEAR"] = "1y";
    ReportsPeriod["ALL"] = "all";
})(ReportsPeriod || (ReportsPeriod = {}));
export class ReportsQueryDto {
    period = ReportsPeriod.THIRTY_DAYS;
}
__decorate([
    ApiPropertyOptional({ enum: ReportsPeriod, default: ReportsPeriod.THIRTY_DAYS }),
    IsEnum(ReportsPeriod),
    IsOptional(),
    __metadata("design:type", String)
], ReportsQueryDto.prototype, "period", void 0);
//# sourceMappingURL=reports-query.dto.js.map