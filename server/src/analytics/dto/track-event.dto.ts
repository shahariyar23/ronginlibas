import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const ALLOWED_EVENT_TYPES = [
  'page_view',
  'view_item_list',
  'select_item',
  'view_item',
  'select_size',
  'select_color',
  'add_to_cart',
  'remove_from_cart',
  'view_cart',
  'begin_checkout',
  'add_shipping_info',
  'add_payment_info',
  'purchase',
  'search',
  'sign_up',
  'login',
  'add_to_wishlist',
  'remove_from_wishlist',
  'view_promotion',
  'select_promotion',
] as const;

export type AllowedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

export class TrackEventDto {
  @IsString()
  @IsIn(ALLOWED_EVENT_TYPES as unknown as string[], {
    message: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`,
  })
  eventType: string;

  @IsString()
  @MaxLength(500)
  pagePath: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  engagementDuration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignName?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

export class TrackEventsBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackEventDto)
  events: TrackEventDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

export class UpdateConsentDto {
  @IsBoolean()
  analyticsConsent: boolean;

  @IsBoolean()
  marketingConsent: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  @IsIn(['today', '7d', '30d', '90d', 'year', 'all'])
  period?: 'today' | '7d' | '30d' | '90d' | 'year' | 'all';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
