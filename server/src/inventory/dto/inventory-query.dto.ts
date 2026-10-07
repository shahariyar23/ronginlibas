import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

enum InventoryFilter {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  IN_STOCK = 'IN_STOCK',
}

export class InventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InventoryFilter })
  @IsEnum(InventoryFilter)
  @IsOptional()
  filter?: InventoryFilter;
}
