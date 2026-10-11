export declare class QueryOffersDto {
    category?: string;
    discountBand?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string[];
    color?: string[];
    tab?: 'all' | 'best-discounts' | 'bundle';
    sort?: 'featured' | 'discount-high' | 'price-low' | 'price-high' | 'newest';
    page?: number;
    limit?: number;
}
export declare class QueryAdminOffersDto {
    search?: string;
    status?: string;
}
