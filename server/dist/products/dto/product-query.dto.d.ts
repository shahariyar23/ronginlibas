import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class ProductQueryDto extends PaginationQueryDto {
    category?: string;
    status?: string;
    gender?: string;
    featured?: boolean;
}
