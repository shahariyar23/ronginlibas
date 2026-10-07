import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class OrderQueryDto extends PaginationQueryDto {
    status?: OrderStatus | 'ALL';
    paymentMethod?: PaymentMethod | 'ALL';
    paymentStatus?: PaymentStatus;
}
