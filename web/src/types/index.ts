export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  category: 'panjabi' | 'shirts' | 'polos' | 't-shirts' | 'trousers' | 'casual' | 'accessories';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  tag?: string;
  images: string[];
  description: string;
  shortDescription?: string;
  fabric: string;
  fabricOrigin?: string;
  fit: string;
  gsm?: number;
  careInstructions?: string;
  careGuide: string[];
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  tags?: string[];
  isExpressAvailable?: boolean;
  sizes: string[];
  colors: {
    name: string;
    hex: string;
  }[];
  inStock: boolean;
  stockCount?: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  variants?: {
    id: string;
    size: string;
    sizeLabel?: string | null;
    sizeType?: 'APPAREL' | 'WAIST' | 'CUSTOM' | null;
    measurements?: Record<string, number | string> | null;
    color: string;
    stock: number;
    priceOverride?: number | string | null;
    isActive?: boolean;
    sku?: string;
  }[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  customNotes?: string;
  cartItemId?: string;
  variantId?: string;
}

export interface FilterState {
  category: string;
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  fabricOrigins: string[];
  tailoringCut: string[];
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest';
}
