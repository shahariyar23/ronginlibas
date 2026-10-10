import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class CustomerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter customers by status: all, active, banned, or archived',
    enum: ['all', 'active', 'banned', 'archived'],
  })
  @IsOptional()
  @IsString()
  status?: 'all' | 'active' | 'banned' | 'archived';
}

export class UpdateCustomerStatusDto {
  @ApiProperty({ description: 'Customer active state flag' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Required explanation / reason from the shop administration when banning',
  })
  @ValidateIf((o) => o.isActive === false)
  @IsNotEmpty({ message: 'A ban reason is required when setting customer status to inactive/banned' })
  @IsString()
  reason?: string;
}

export class PermanentDeleteCustomerDto {
  @ApiProperty({ description: 'Mandatory confirmation marker for irreversible customer deletion' })
  @IsBoolean()
  confirm: boolean;

  @ApiPropertyOptional({ description: 'Optional administrative deletion reason/note' })
  @IsOptional()
  @IsString()
  reason?: string;
}
