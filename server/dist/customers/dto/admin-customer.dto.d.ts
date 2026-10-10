import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class CustomerQueryDto extends PaginationQueryDto {
    status?: 'all' | 'active' | 'banned' | 'archived';
}
export declare class UpdateCustomerStatusDto {
    isActive: boolean;
    reason?: string;
}
export declare class PermanentDeleteCustomerDto {
    confirm: boolean;
    reason?: string;
}
