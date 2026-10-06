export declare class CreateVariantDto {
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number;
}
export declare class CreateProductImageDto {
    url: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    sku: string;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fabric?: string;
    fit?: string;
    categoryId: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    variants?: CreateVariantDto[];
    images?: CreateProductImageDto[];
}
