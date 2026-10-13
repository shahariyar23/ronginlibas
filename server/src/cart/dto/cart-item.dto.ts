import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cartId?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cartId?: string;
}

export class CartIdentityDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cartId?: string;
}

export class CartContactDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cartId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;
}

export class AdminCartQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  filter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;
}

export class SendCartReminderDto {
  @ApiPropertyOptional()
  @IsOptional()
  customMessage?: string;
}

export class RestoreCartFromOrderDto {
  @ApiProperty({ description: 'Order ID or Order Number' })
  orderId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cartId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  trackingToken?: string;
}

