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
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class PaymentWebhookDto {
    full_name;
    email;
    amount;
    fee;
    charged_amount;
    invoice_id;
    metadata;
    payment_method;
    sender_number;
    transaction_id;
    date;
    status;
}
__decorate([
    ApiPropertyOptional({ description: 'Customer full name', example: 'John Doe' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "full_name", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Customer email address', example: 'john@example.com' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ description: 'Authorized payment amount', example: '500.00' }),
    IsNotEmpty(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "amount", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Gateway processing fee', example: '1.50' }),
    IsOptional(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "fee", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Total charged amount', example: '501.50' }),
    IsOptional(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "charged_amount", void 0);
__decorate([
    ApiProperty({ description: 'UddoktaPay invoice ID', example: '60839DE16AD' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "invoice_id", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Metadata payload passed during session creation',
        example: { order_id: '...', order_number: '...', payment_attempt_id: '...' },
    }),
    IsOptional(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "metadata", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Payment method channel (bKash, Nagad, Rocket, etc.)', example: 'bKash' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "payment_method", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Sender mobile or account number', example: '017XXXXXXXX' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "sender_number", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Transaction ID from payment network', example: 'TRX123456789' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "transaction_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Transaction timestamp', example: '2026-10-15 12:00:00' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "date", void 0);
__decorate([
    ApiProperty({ description: 'Payment status from UddoktaPay (COMPLETED, PENDING, ERROR)', example: 'COMPLETED' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "status", void 0);
export class UddoktaWebhookPayloadDto extends PaymentWebhookDto {
}
//# sourceMappingURL=payment-webhook.dto.js.map