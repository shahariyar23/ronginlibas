export const STANDARD_APPAREL_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '4XL',
  '5XL',
];

export const TROUSER_WAIST_SIZES = ['28', '30', '32', '34', '36', '38', '40'];

export type ProductSizeType = 'APPAREL' | 'WAIST' | 'CUSTOM';

export function isProductSizeType(value: unknown): value is ProductSizeType {
  return value === 'APPAREL' || value === 'WAIST' || value === 'CUSTOM';
}

export function normalizeSizeLabel(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  const apparelLabel = STANDARD_APPAREL_SIZES.find(
    (size) => size.toLowerCase() === trimmed.toLowerCase(),
  );
  return apparelLabel ?? trimmed;
}

export function getPresetSizeType(size: string): ProductSizeType | undefined {
  const normalized = normalizeSizeLabel(size);
  if (STANDARD_APPAREL_SIZES.includes(normalized)) return 'APPAREL';
  if (TROUSER_WAIST_SIZES.includes(normalized)) return 'WAIST';
  return undefined;
}

export function getConfiguredSizeType(
  size: string,
  variants: Array<{ size: string; sizeLabel?: string | null; sizeType?: string | null }>,
  customTypes: Record<string, ProductSizeType>,
  category: string,
): ProductSizeType | undefined {
  const normalized = normalizeSizeLabel(size);
  const existing = variants.filter(
    (variant) => normalizeSizeLabel(variant.sizeLabel || variant.size) === normalized,
  );
  const existingType = existing.find((variant) => variant.sizeType)?.sizeType;
  if (existingType === 'APPAREL' || existingType === 'WAIST' || existingType === 'CUSTOM') {
    return existingType;
  }
  if (STANDARD_APPAREL_SIZES.includes(normalized)) return 'APPAREL';
  if (customTypes[normalized]) return customTypes[normalized];
  if (existing.length) {
    return undefined;
  }

  const presetType = getPresetSizeType(normalized);
  const isTrouser = /trouser|pant/i.test(category);
  return presetType === 'WAIST' && !isTrouser ? undefined : presetType;
}
