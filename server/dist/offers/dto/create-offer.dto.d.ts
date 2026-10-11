import { OfferType, OfferDiscountType } from '@prisma/client';
export declare class CreateOfferDto {
    name: string;
    slug?: string;
    description?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerMessage?: string;
    offerType?: OfferType;
    discountType: OfferDiscountType;
    discountValue: number;
    startDate: string;
    expiryDate: string;
    isActive?: boolean;
    badgeText?: string;
    couponCode?: string;
    priority?: number;
    productIds?: string[];
    categoryIds?: string[];
    collectionIds?: string[];
}
