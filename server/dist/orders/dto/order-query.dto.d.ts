import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class OrderQueryDto extends PaginationQueryDto {
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
}
