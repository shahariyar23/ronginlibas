export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface PaginatedData<T> {
    items: T[];
    meta: PaginationMeta;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errorCode?: string;
    meta?: PaginationMeta;
}
