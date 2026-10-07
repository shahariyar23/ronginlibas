export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  promotionalPrice?: number;
  costOfGoods?: number;
  stock: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  image: string;
  fabricNote?: string;
  description?: string;
  variants?: {
    id?: string;
    size: string;
    shade?: string;
    color?: string;
    sku: string;
    price?: number;
    priceOverride?: number;
    stock: number;
    active?: boolean;
    isActive?: boolean;
  }[];
  tags?: string[];
  featured?: boolean;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  gender?: string | null;
  fabric?: string | null;
  fabricOrigin?: string | null;
  fit?: string | null;
  gsm?: number | null;
  careInstructions?: string | null;
  tags?: string[];
  isExpressAvailable?: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
  } | null;
  images: {
    id: string;
    url: string;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: {
    id: string;
    size: string;
    sizeLabel?: string | null;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number | null;
    isActive: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerLocation: string;
  phone: string;
  amount: number;
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'CARD';
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  dateStr: string;
  timeDetail: string;
  itemCount: number;
  itemsSummary: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  subtitle: string;
  sku: string;
  category: string;
  stock: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  image: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  website: string;
  facebook: string;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  bkashEnabled: boolean;
  bkashWallet: string;
  nagadEnabled: boolean;
  nagadWallet: string;
}

// Empty initial arrays - data is dynamically populated from the live database
export const INITIAL_PRODUCTS: AdminProduct[] = [];
export const INITIAL_ORDERS: AdminOrder[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Rongin Libas',
  phone: '+880 1916-664011',
  whatsapp: '+880 1916-664011',
  website: 'https://ronginlibas.com',
  facebook: 'https://facebook.com/ronginlibas.bd',
  dhakaDeliveryCharge: 80,
  outsideDhakaDeliveryCharge: 150,
  freeDeliveryThreshold: 3000,
  codEnabled: true,
  bkashEnabled: true,
  bkashWallet: '01711-223344',
  nagadEnabled: true,
  nagadWallet: '01822-554499',
};

