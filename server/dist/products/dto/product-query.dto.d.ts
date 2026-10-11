import { Gender } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class ProductQueryDto extends PaginationQueryDto {
    category?: string;
    collection?: string;
    status?: string;
    gender?: Gender;
    size?: string[];
    color?: string[];
    fabric?: string[];
    fabricOrigin?: string[];
    fit?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    onSale?: boolean;
    expressAvailable?: boolean;
    sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'price-low' | 'price-high' | 'best-selling';
}
