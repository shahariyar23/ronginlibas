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
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class MeasurementProfileDto {
    chest;
    shoulder;
    sleeveLength;
    collar;
    waist;
    trouserLength;
    garmentLength;
    tailoringNotes;
}
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "chest", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "shoulder", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "sleeveLength", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "collar", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "waist", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "trouserLength", void 0);
__decorate([
    ApiPropertyOptional(),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    Max(500),
    IsOptional(),
    __metadata("design:type", Number)
], MeasurementProfileDto.prototype, "garmentLength", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(2000),
    IsOptional(),
    __metadata("design:type", String)
], MeasurementProfileDto.prototype, "tailoringNotes", void 0);
//# sourceMappingURL=measurement-profile.dto.js.map