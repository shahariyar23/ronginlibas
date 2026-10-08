export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    search?: string;
}
export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    summary?: Record<string, any>;
}
