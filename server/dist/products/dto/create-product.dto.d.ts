import { Prisma } from '@prisma/client';
export declare class CreateVariantDto {
    size: string;
    sizeLabel?: string;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number;
    measurements?: Prisma.InputJsonObject;
}
export declare class CreateProductImageDto {
    url: string;
    publicId?: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    sku: string;
    gender?: 'MEN' | 'WOMEN' | 'UNISEX';
    fabric?: string;
    fabricOrigin?: string;
    fit?: string;
    gsm?: number;
    careInstructions?: string;
    tags?: string[];
    isExpressAvailable?: boolean;
    categoryId: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    variants?: CreateVariantDto[];
    images?: CreateProductImageDto[];
}
