import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsIn([...Object.values(OrderStatus), 'ALL'])
  @IsOptional()
  status?: OrderStatus | 'ALL';

  @ApiPropertyOptional()
  @IsIn([...Object.values(PaymentMethod), 'ALL'])
  @IsOptional()
  paymentMethod?: PaymentMethod | 'ALL';

  @ApiPropertyOptional()
  @IsIn(Object.values(PaymentStatus))
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
