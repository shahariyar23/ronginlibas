export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  promotionalPrice?: number;
  costOfGoods?: number;
  stock: number;
  alertThreshold?: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  image: string;
  images?: {
    url: string;
    publicId?: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    file?: File;
  }[];
  fabricNote?: string;
  description?: string;
  variants?: {
    id?: string;
    size: string;
    sizeLabel?: string | null;
    sizeType?: 'APPAREL' | 'WAIST' | 'CUSTOM' | null;
    measurements?: Record<string, number | string> | null;
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
  alertThreshold?: number | null;
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
    publicId?: string | null;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: {
    id: string;
    size: string;
    sizeLabel?: string | null;
    sizeType?: 'APPAREL' | 'WAIST' | 'CUSTOM' | null;
    measurements?: Record<string, number | string> | null;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number | null;
    isActive: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface AdminOrderAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  division?: string;
  deliveryInstructions?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerLocation: string;
  fullAddress?: AdminOrderAddress;
  phone: string;
  amount: number;
  subtotal?: number;
  discountAmount?: number;
  deliveryCharge?: number;
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'CARD';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  dateStr: string;
  timeDetail: string;
  itemCount: number;
  itemsSummary: string;
  items: AdminOrderItem[];
  customerNotes?: string;
  adminNotes?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  variantId: string;
  productId?: string;
  name: string;
  subtitle: string;
  sku: string;
  category: string;
  size: string;
  color: string;
  onHand: number;
  reserved: number;
  available: number;
  stock: number;
  alertThreshold: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  image: string;
}

export interface InventoryTransactionRecord {
  id: string;
  variantId: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  type: string;
  reason?: string;
  note?: string;
  reference?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}


export interface StoreSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  website: string;
  facebook: string;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  freeShippingEnabled: boolean;
  freeDeliveryThreshold: number;
  promoEnabled: boolean;
  promoCode: string;
  promoDiscountText: string;
  whatsappOrderEnabled: boolean;
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
  facebook: 'https://facebook.com/ronginlibas',
  dhakaDeliveryCharge: 80,
  outsideDhakaDeliveryCharge: 150,
  freeShippingEnabled: true,
  freeDeliveryThreshold: 3000,
  promoEnabled: false,
  promoCode: '',
  promoDiscountText: '',
  whatsappOrderEnabled: true,
  codEnabled: true,
  bkashEnabled: true,
  bkashWallet: '01711-223344',
  nagadEnabled: true,
  nagadWallet: '01822-554499',
};
