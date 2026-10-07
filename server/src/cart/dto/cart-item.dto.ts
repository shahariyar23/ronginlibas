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
