export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'panjabi' | 'shirts' | 'polos' | 't-shirts' | 'trousers' | 'casual';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  tag?: string;
  images: string[];
  description: string;
  fabric: string;
  fabricOrigin?: string;
  fit: string;
  careGuide: string[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL' | 'Bespoke')[];
  colors: {
    name: string;
    hex: string;
  }[];
  inStock: boolean;
  stockCount?: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  customNotes?: string;
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
