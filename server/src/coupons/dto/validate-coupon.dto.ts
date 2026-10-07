import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CouponCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ type: [CouponCartItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CouponCartItemDto)
  items: CouponCartItemDto[];
}
