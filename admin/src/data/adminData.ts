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
    size: string;
    shade: string;
    sku: string;
    price: number;
    stock: number;
    active: boolean;
  }[];
  tags?: string[];
  featured?: boolean;
}

export interface AdminOrder {
  id: string;
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

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'p-1',
    name: 'Premium Green Panjabi',
    sku: 'RL-PNJ-01',
    category: 'Panjabi',
    price: 2490,
    promotionalPrice: 2290,
    costOfGoods: 1100,
    stock: 18,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    fabricNote: '100% Giza Egyptian Mercerised Cotton',
    description: 'Handcrafted for solemn evening gatherings and celebratory Eid assemblies. Tailored from premium 120s double-ply combed Egyptian cotton with a silken mercerized luster.',
    tags: ['EID 2026', 'EGYPTIAN COTTON', 'ZARI WORK', 'HERITAGE ATELIER'],
    featured: true
  },
  {
    id: 'p-2',
    name: 'Classic White Shirt',
    sku: 'RL-SHT-02',
    category: 'Shirts',
    price: 1990,
    promotionalPrice: 1850,
    costOfGoods: 850,
    stock: 12,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA',
    fabricNote: '120s Two-Ply Pinpoint Oxford',
    description: 'Immaculately tailored architectural formal shirt with semi-spread collar and mother-of-pearl buttons.',
    tags: ['FORMAL', 'OXFORD WEAVE', 'ESSENTIALS'],
    featured: false
  },
  {
    id: 'p-3',
    name: 'Premium Polo Blue',
    sku: 'RL-PLO-04',
    category: 'Polo',
    price: 1490,
    promotionalPrice: 1350,
    costOfGoods: 620,
    stock: 3,
    status: 'Low Stock',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp6prKVoZ0R9-jKzP-YQB8wMT6hbb__r_FtajSVsyjsj7DN258168wzOeWmTZh012sfXVDLYDyBJ9O4WemrbxHYPuvF2wUPDq_tNnslEOs7adSqUHf_4O7sZABfm4uH2cne_54kPrqUdv8fsJKGKGPHfo9FL53SaUzi_iAFvgSNE_lt6cExGqN9ojCKcT8DJNyDX5rI6GQr69inbIUgBAa_V2V-oxKznUWVJcyLSS81-54o9kULUiVBw',
    fabricNote: 'Supima Honeycomb Knit',
    description: 'Double-mercerized 100% long-staple cotton polo with subtle natural luster and anti-curl collar.',
    tags: ['KNITWEAR', 'SUPIMA', 'CASUAL LUXURY'],
    featured: true
  },
  {
    id: 'p-4',
    name: 'Royal Jamdani Panjabi',
    sku: 'RL-PNJ-09',
    category: 'Panjabi',
    price: 4800,
    promotionalPrice: 4500,
    costOfGoods: 2100,
    stock: 5,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsI5ug241TvsSl6uRptjdZWUUmaLTgXRnq-N6fF3plJmG4bX3qnBL96Zj__lAnv6CmmwMSQvs3jE80Mo33uOIdI455vzCYnNF5aSZaVZ7WvS6KxN9jTrnGo62nMOazBMaiMY5oZPmH-GfoBuAOBSQe_gCSdPpN2H290wtqPtQXsgN_xpV5ptQbaKzZhRMATVIbDQffLn3YH4UMuADiWsJLKwNKhuVwh9gtoCYuZCNyLI1FNDePkmyH0w',
    fabricNote: 'Heritage Tangail Weave (Limited Edition)',
    description: 'Exclusively handloomed Jamdani geometric motifs crafted over 45 days by ancestral artisans.',
    tags: ['HERITAGE', 'JAMDANI', 'LIMITED EDITION', 'HANDLOOM'],
    featured: true
  },
  {
    id: 'p-5',
    name: 'Charcoal Linen Shirt',
    sku: 'RL-SHT-05',
    category: 'Shirts',
    price: 2250,
    promotionalPrice: 2100,
    costOfGoods: 980,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBXBXYsZycaC5UgZhpxdd8qqwv5VJziYh7m4vOBKvnonaCtQNy-bPb6JgNSj7DroBEZPjipvO8wR_WM0Z87LlCJE9wO-sz43GdXzYDFIa7jjjWJ_7WWDw6Xl5qFEfuyK69bVYGqBMypcVF7NNLgRTSqxXtIFhwOHA1nRZxtZMHQGxev-71R401QhaXaGfbbx9XZnVHgCswJuJf_wdP8F91pAqnP0K2Dt9GdfWQdkGTI6R8eO9VebbB4w',
    fabricNote: 'French Flax Pure Linen',
    description: 'Breathable, relaxed-fit linen shirt designed for sultry climates, featuring refined topstitching.',
    tags: ['PURE LINEN', 'SUMMER', 'CASUAL'],
    featured: false
  },
  {
    id: 'p-6',
    name: 'Tailored Churidar Pajama',
    sku: 'RL-PJM-01',
    category: 'Trousers',
    price: 1150,
    promotionalPrice: 1150,
    costOfGoods: 450,
    stock: 24,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNojW3Mb-iaGZqd3IfUwHc7FerS1DohWFGKI_knJRxsXWwp_5iC5A00YKo5SM08UWWLTtHS3f-zDl-0dUtaJgBjnt2nOE-Q8cfsl_85KDsA4cnBrvo0PzRfOumKm2jc8bhBongguJiugng6HjRtesEf46ilXnPuF6D2Mgs9gGpZeiSmP0lKGdWZB3TELXKWL-Mcem3wZwculGGKpQMMiHEFYt5jjzDwZ6nOr-WXPn8s_XqWacS9HtNg',
    fabricNote: 'Fine Cotton Twill with Comfort Stretch',
    description: 'Traditional gather-hem churidar tapered silhouette engineered specifically for paired panjabi suits.',
    tags: ['PAJAMA', 'ESSENTIALS', 'TAILORED'],
    featured: false
  }
];

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: '#RL1001',
    customerName: 'Rahim',
    customerLocation: 'Gulshan-2, Dhaka',
    phone: '01711-234567',
    amount: 2490,
    paymentMethod: 'COD',
    status: 'PENDING',
    dateStr: '10 mins ago',
    timeDetail: 'Today, 02:45 PM',
    itemCount: 1,
    itemsSummary: 'Premium Green Panjabi (Size 42)'
  },
  {
    id: '#RL1002',
    customerName: 'Karim',
    customerLocation: 'Dhanmondi, Dhaka',
    phone: '01819-445566',
    amount: 3990,
    paymentMethod: 'BKASH',
    status: 'SHIPPED',
    dateStr: '45 mins ago',
    timeDetail: 'Today, 02:10 PM',
    itemCount: 2,
    itemsSummary: 'Classic White Shirt, Tailored Pajama'
  },
  {
    id: '#RL1003',
    customerName: 'Hasan',
    customerLocation: 'Uttara Sec-4, Dhaka',
    phone: '01912-889900',
    amount: 1990,
    paymentMethod: 'COD',
    status: 'DELIVERED',
    dateStr: '2 hours ago',
    timeDetail: 'Today, 12:50 PM',
    itemCount: 1,
    itemsSummary: 'Classic White Shirt (Size 40)'
  },
  {
    id: '#RL1004',
    customerName: 'Tanvir',
    customerLocation: 'Banani, Dhaka',
    phone: '01712-334455',
    amount: 4800,
    paymentMethod: 'NAGAD',
    status: 'PROCESSING',
    dateStr: '3 hours ago',
    timeDetail: 'Today, 11:30 AM',
    itemCount: 1,
    itemsSummary: 'Royal Jamdani Panjabi (Size 44)'
  },
  {
    id: '#RL1005',
    customerName: 'Asif',
    customerLocation: 'Chittagong GEC',
    phone: '01611-998877',
    amount: 5250,
    paymentMethod: 'BKASH',
    status: 'CONFIRMED',
    dateStr: '5 hours ago',
    timeDetail: 'Today, 09:15 AM',
    itemCount: 2,
    itemsSummary: 'Premium Green Panjabi, Churidar Pajama'
  },
  {
    id: '#RL1006',
    customerName: 'Mahfuz',
    customerLocation: 'Mirpur-10, Dhaka',
    phone: '01711-882233',
    amount: 1490,
    paymentMethod: 'COD',
    status: 'CANCELLED',
    dateStr: 'Yesterday',
    timeDetail: 'Oct 23, 07:12 PM',
    itemCount: 1,
    itemsSummary: 'Premium Polo Blue (Size L)'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Premium Green Panjabi',
    subtitle: '100% Egyptian Mercerised Cotton',
    sku: 'RL-PNJ-01',
    category: 'Panjabi',
    stock: 18,
    status: 'IN STOCK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ'
  },
  {
    id: 'inv-2',
    name: 'Black Panjabi',
    subtitle: 'Bespoke Textured Linen',
    sku: 'RL-PNJ-02',
    category: 'Panjabi',
    stock: 3,
    status: 'LOW STOCK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ'
  },
  {
    id: 'inv-3',
    name: 'Classic White Shirt',
    subtitle: '120s Two-Ply Pinpoint Oxford',
    sku: 'RL-SHT-02',
    category: 'Shirts',
    stock: 0,
    status: 'OUT OF STOCK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA'
  },
  {
    id: 'inv-4',
    name: 'Premium Polo Blue',
    subtitle: 'Supima Honeycomb Knit',
    sku: 'RL-PLO-04',
    category: 'Polo',
    stock: 15,
    status: 'IN STOCK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp6prKVoZ0R9-jKzP-YQB8wMT6hbb__r_FtajSVsyjsj7DN258168wzOeWmTZh012sfXVDLYDyBJ9O4WemrbxHYPuvF2wUPDq_tNnslEOs7adSqUHf_4O7sZABfm4uH2cne_54kPrqUdv8fsJKGKGPHfo9FL53SaUzi_iAFvgSNE_lt6cExGqN9ojCKcT8DJNyDX5rI6GQr69inbIUgBAa_V2V-oxKznUWVJcyLSS81-54o9kULUiVBw'
  },
  {
    id: 'inv-5',
    name: 'Royal Jamdani Panjabi',
    subtitle: 'Heritage Tangail Weave (Limited)',
    sku: 'RL-PNJ-09',
    category: 'Panjabi',
    stock: 2,
    status: 'LOW STOCK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsI5ug241TvsSl6uRptjdZWUUmaLTgXRnq-N6fF3plJmG4bX3qnBL96Zj__lAnv6CmmwMSQvs3jE80Mo33uOIdI455vzCYnNF5aSZaVZ7WvS6KxN9jTrnGo62nMOazBMaiMY5oZPmH-GfoBuAOBSQe_gCSdPpN2H290wtqPtQXsgN_xpV5ptQbaKzZhRMATVIbDQffLn3YH4UMuADiWsJLKwNKhuVwh9gtoCYuZCNyLI1FNDePkmyH0w'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Rongin Libas',
  phone: '+880 1916-234567',
  whatsapp: '+880 1916-234567',
  website: 'www.ronginlibas.com',
  facebook: 'facebook.com/ronginlibas.bd',
  dhakaDeliveryCharge: 80,
  outsideDhakaDeliveryCharge: 150,
  freeDeliveryThreshold: 3000,
  codEnabled: true,
  bkashEnabled: true,
  bkashWallet: '01711-223344',
  nagadEnabled: true,
  nagadWallet: '01822-554499'
};
