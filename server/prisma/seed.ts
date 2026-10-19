import { PrismaClient, Role, Gender, OrderStatus, PaymentStatus, PaymentMethod, CouponType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Rongin Libas database...');

  // 1. Super Admin User
  const hashedPassword = await bcrypt.hash('AtelierSecret2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ronginlibas.com' },
    update: {
      passwordHash: hashedPassword,
      firstName: 'Master',
      lastName: 'Tailor Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ronginlibas.com',
      passwordHash: hashedPassword,
      firstName: 'Master',
      lastName: 'Tailor Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✓ Admin user: ${adminUser.email}`);

  // 2. Categories
  const categoriesData = [
    {
      id: 'cat-panjabi',
      name: 'Panjabi',
      slug: 'panjabi',
      description: 'Traditional Elegance & Ancestral Weaves',
      sortOrder: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ',
    },
    {
      id: 'cat-shirts',
      name: 'Shirts',
      slug: 'shirts',
      description: 'Sartorial Precision & Egyptian Cotton',
      sortOrder: 2,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA',
    },
    {
      id: 'cat-polos',
      name: 'Polos',
      slug: 'polos',
      description: 'Luxe Knitwear & Mercerized Piqué',
      sortOrder: 3,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAmVsKJzvDEQVHfLGmjgJwWPGJfn1a2OlhNngQ3nQzAJf41R7NnnV-rjHQQV9IFp9bxVMaxpkVVPaHFkoj3KmCIVndJEVqT6qX2HKbHzUolTPekC8iHzLHR3URpP-PAoeYZl8P5c30xXZc4jdqI3oLFuIYkk050s12nCekoOGiT1ZoR8alKDWoeUUNTVz0HB9I0dGbBb0HV051UwtYW1jW1ICC-lA-aVb8auL0lXIg4PfLRdtWxyhdKw',
    },
    {
      id: 'cat-trousers',
      name: 'Trousers',
      slug: 'trousers',
      description: 'Modern Tailoring & Churidar Cuts',
      sortOrder: 4,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNojW3Mb-iaGZqd3IfUwHc7FerS1DohWFGKI_knJRxsXWwp_5iC5A00YKo5SM08UWWLTtHS3f-zDl-0dUtaJgBjnt2nOE-Q8cfsl_85KDsA4cnBrvo0PzRfOumKm2jc8bhBongguJiugng6HjRtesEf46ilXnPuF6D2Mgs9gGpZeiSmP0lKGdWZB3TELXKWL-Mcem3wZwculGGKpQMMiHEFYt5jjzDwZ6nOr-WXPn8s_XqWacS9HtNg',
    },
    {
      id: 'cat-tshirts',
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Heavyweight Architectural Cotton 260 GSM',
      sortOrder: 5,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log(`✓ Seeded ${categoriesData.length} categories`);

  // 3. Products with Variants and Images
  const productsData = [
    {
      id: 'prod-001',
      name: 'Premium Green Panjabi',
      slug: 'premium-green-panjabi',
      sku: 'RL-PNJ-01',
      description:
        'Handcrafted for solemn evening gatherings and celebratory Eid assemblies. Tailored from premium 120s double-ply combed Egyptian cotton with a silken mercerized luster.',
      price: 2490,
      compareAtPrice: 2890,
      costPrice: 1100,
      gender: Gender.MEN,
      fabric: '100% Giza Egyptian Mercerised Cotton',
      fit: 'Heritage Slim Cut',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      categoryId: 'cat-panjabi',
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { size: '38', color: 'Heritage Olive', sku: 'RL-PNJ-01-38', stock: 4, priceOverride: 2490 },
        { size: '40', color: 'Heritage Olive', sku: 'RL-PNJ-01-40', stock: 6, priceOverride: 2490 },
        { size: '42', color: 'Heritage Olive', sku: 'RL-PNJ-01-42', stock: 5, priceOverride: 2490 },
        { size: '44', color: 'Heritage Olive', sku: 'RL-PNJ-01-44', stock: 3, priceOverride: 2490 },
      ],
    },
    {
      id: 'prod-002',
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      sku: 'RL-SHT-02',
      description:
        'Immaculately tailored architectural formal shirt with semi-spread collar and mother-of-pearl buttons.',
      price: 1990,
      compareAtPrice: 2290,
      costPrice: 850,
      gender: Gender.MEN,
      fabric: '120s Two-Ply Pinpoint Oxford',
      fit: 'Atelier Contemporary Fit',
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      categoryId: 'cat-shirts',
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { size: '38', color: 'Pure Optical White', sku: 'RL-SHT-02-38', stock: 3, priceOverride: 1990 },
        { size: '40', color: 'Pure Optical White', sku: 'RL-SHT-02-40', stock: 4, priceOverride: 1990 },
        { size: '42', color: 'Pure Optical White', sku: 'RL-SHT-02-42', stock: 3, priceOverride: 1990 },
        { size: '44', color: 'Pure Optical White', sku: 'RL-SHT-02-44', stock: 2, priceOverride: 1990 },
      ],
    },
    {
      id: 'prod-003',
      name: 'Royal Jamdani Panjabi',
      slug: 'royal-jamdani-panjabi',
      sku: 'RL-PNJ-03',
      description:
        'Ancestral Jamdani motifs woven by master artisans in Narayanganj. Designed for weddings and state occasions.',
      price: 4950,
      compareAtPrice: 5500,
      costPrice: 2200,
      gender: Gender.MEN,
      fabric: 'Handspun Fine Muslin & Silk Blend',
      fit: 'Regal Traditional Cut',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      categoryId: 'cat-panjabi',
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { size: '40', color: 'Midnight Gold', sku: 'RL-PNJ-03-40', stock: 2, priceOverride: 4950 },
        { size: '42', color: 'Midnight Gold', sku: 'RL-PNJ-03-42', stock: 3, priceOverride: 4950 },
      ],
    },
    {
      id: 'prod-004',
      name: 'Luxe Mercerized Piqué Polo',
      slug: 'luxe-mercerized-pique-polo',
      sku: 'RL-PLO-04',
      description: 'Silken finish double mercerized piqué polo with ribbed collar and genuine horn buttons.',
      price: 1750,
      compareAtPrice: 1950,
      costPrice: 700,
      gender: Gender.MEN,
      fabric: '100% Combed Cotton Piqué',
      fit: 'Tailored Sport Fit',
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      categoryId: 'cat-polos',
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAmVsKJzvDEQVHfLGmjgJwWPGJfn1a2OlhNngQ3nQzAJf41R7NnnV-rjHQQV9IFp9bxVMaxpkVVPaHFkoj3KmCIVndJEVqT6qX2HKbHzUolTPekC8iHzLHR3URpP-PAoeYZl8P5c30xXZc4jdqI3oLFuIYkk050s12nCekoOGiT1ZoR8alKDWoeUUNTVz0HB9I0dGbBb0HV051UwtYW1jW1ICC-lA-aVb8auL0lXIg4PfLRdtWxyhdKw',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { size: 'M', color: 'Navy Atelier', sku: 'RL-PLO-04-M', stock: 8, priceOverride: 1750 },
        { size: 'L', color: 'Navy Atelier', sku: 'RL-PLO-04-L', stock: 12, priceOverride: 1750 },
        { size: 'XL', color: 'Navy Atelier', sku: 'RL-PLO-04-XL', stock: 5, priceOverride: 1750 },
      ],
    },
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findUnique({ where: { sku: prod.sku } });
    if (!existing) {
      await prisma.product.create({
        data: {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          description: prod.description,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          costPrice: prod.costPrice,
          gender: prod.gender,
          fabric: prod.fabric,
          fit: prod.fit,
          isActive: prod.isActive,
          isFeatured: prod.isFeatured,
          isNewArrival: prod.isNewArrival,
          isBestSeller: prod.isBestSeller,
          categoryId: prod.categoryId,
          images: {
            create: prod.images,
          },
          variants: {
            create: prod.variants,
          },
        },
      });
    }
  }
  console.log(`✓ Seeded ${productsData.length} products with variants`);

  // 4. Customers & Addresses
  const customersData = [
    {
      id: 'cust-001',
      firstName: 'Rahim',
      lastName: 'Chowdhury',
      email: 'rahim.c@gmail.com',
      phone: '01711-234567',
      address: {
        addressLine1: 'Road 79, House 14, Gulshan-2',
        city: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1212',
      },
    },
    {
      id: 'cust-002',
      firstName: 'Karimul',
      lastName: 'Islam',
      email: 'k.islam@yahoo.com',
      phone: '01819-445566',
      address: {
        addressLine1: 'Road 8/A, House 23, Dhanmondi',
        city: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1209',
      },
    },
    {
      id: 'cust-003',
      firstName: 'Syed Tanvir',
      lastName: 'Hasan',
      email: 'tanvir.hasan@outlook.com',
      phone: '01712-334455',
      address: {
        addressLine1: 'Block D, Road 11, Banani',
        city: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1213',
      },
    },
    {
      id: 'cust-004',
      firstName: 'Farhan',
      lastName: 'Mahmud',
      email: 'farhan.m@gmail.com',
      phone: '01611-998877',
      address: {
        addressLine1: 'GEC Circle, Nasirabad',
        city: 'Chittagong',
        division: 'Chittagong',
        postalCode: '4000',
      },
    },
  ];

  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: { firstName: c.firstName, lastName: c.lastName, email: c.email },
      create: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        addresses: {
          create: {
            addressLine1: c.address.addressLine1,
            city: c.address.city,
            division: c.address.division,
            postalCode: c.address.postalCode,
            phone: c.phone,
            isDefault: true,
          },
        },
      },
    });
  }
  console.log(`✓ Seeded ${customersData.length} clientele records`);

  // 5. Orders & Order Items
  const ordersData = [
    {
      orderNumber: '#RL1001',
      customerId: 'cust-001',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.COD,
      subtotal: 2490,
      deliveryCharge: 80,
      totalAmount: 2570,
      shippingAddress: {
        address: 'Road 79, House 14, Gulshan-2, Dhaka',
        city: 'Dhaka',
        phone: '01711-234567',
        recipient: 'Rahim Chowdhury',
      },
      items: [
        {
          productId: 'prod-001',
          variantId: 'prod-001-var-38',
          productName: 'Premium Green Panjabi (Size 38)',
          variantName: 'Heritage Olive / 38',
          sku: 'RL-PNJ-01-38',
          unitPrice: 2490,
          quantity: 1,
          subtotal: 2490,
        },
      ],
    },
    {
      orderNumber: '#RL1002',
      customerId: 'cust-002',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BKASH,
      subtotal: 3980,
      deliveryCharge: 80,
      totalAmount: 4060,
      shippingAddress: {
        address: 'Road 8/A, House 23, Dhanmondi, Dhaka',
        city: 'Dhaka',
        phone: '01819-445566',
        recipient: 'Karimul Islam',
      },
      items: [
        {
          productId: 'prod-002',
          variantId: 'prod-002-var-40',
          productName: 'Classic White Shirt (Size 40)',
          variantName: 'Pure Optical White / 40',
          sku: 'RL-SHT-02-40',
          unitPrice: 1990,
          quantity: 2,
          subtotal: 3980,
        },
      ],
    },
    {
      orderNumber: '#RL1003',
      customerId: 'cust-003',
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.NAGAD,
      subtotal: 4950,
      deliveryCharge: 0,
      totalAmount: 4950,
      shippingAddress: {
        address: 'Block D, Road 11, Banani, Dhaka',
        city: 'Dhaka',
        phone: '01712-334455',
        recipient: 'Syed Tanvir Hasan',
      },
      items: [
        {
          productId: 'prod-003',
          variantId: 'prod-003-var-42',
          productName: 'Royal Jamdani Panjabi (Size 42)',
          variantName: 'Midnight Gold / 42',
          sku: 'RL-PNJ-03-42',
          unitPrice: 4950,
          quantity: 1,
          subtotal: 4950,
        },
      ],
    },
    {
      orderNumber: '#RL1004',
      customerId: 'cust-004',
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.COD,
      subtotal: 3500,
      deliveryCharge: 150,
      totalAmount: 3650,
      shippingAddress: {
        address: 'GEC Circle, Nasirabad, Chittagong',
        city: 'Chittagong',
        phone: '01611-998877',
        recipient: 'Farhan Mahmud',
      },
      items: [
        {
          productId: 'prod-004',
          variantId: 'prod-004-var-L',
          productName: 'Luxe Mercerized Piqué Polo (Size L)',
          variantName: 'Navy Atelier / L',
          sku: 'RL-PLO-04-L',
          unitPrice: 1750,
          quantity: 2,
          subtotal: 3500,
        },
      ],
    },
  ];

  for (const o of ordersData) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: o.orderNumber } });
    if (!existing) {
      // Find actual variant id from DB
      const firstVariant = await prisma.productVariant.findFirst({
        where: { productId: o.items[0].productId },
      });

      await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          subtotal: o.subtotal,
          deliveryCharge: o.deliveryCharge,
          totalAmount: o.totalAmount,
          shippingAddress: o.shippingAddress,
          items: {
            create: o.items.map((it) => ({
              productId: it.productId,
              variantId: firstVariant?.id || 'sample-var-id',
              productName: it.productName,
              variantName: it.variantName,
              sku: it.sku,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              subtotal: it.subtotal,
            })),
          },
        },
      });
    }
  }
  console.log(`✓ Seeded ${ordersData.length} orders`);

  // 6. Coupons
  const couponsData = [
    {
      code: 'EID2026',
      description: 'Eid Celebration 15% Sartorial Privilege',
      type: CouponType.PERCENTAGE,
      value: 15,
      minimumOrderAmount: 5000,
      maximumDiscount: 1500,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      usageLimit: 500,
      usageCount: 142,
      isActive: true,
    },
    {
      code: 'BESPOKE1000',
      description: 'Flat ৳1,000 Off on High-Value Atelier Orders',
      type: CouponType.FIXED,
      value: 1000,
      minimumOrderAmount: 8000,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      usageLimit: 200,
      usageCount: 38,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Seeded ${couponsData.length} coupons`);

  // 7. Store Settings
  const settingsData: Record<string, any> = {
    storeName: 'Rongin Libas',
    logo: '/logo.svg',
    phone: '01352926067',
    whatsapp: '01352926067',
    email: 'concierge@ronginlibas.com',
    website: 'https://ronginlibas.com',
    facebook: 'https://facebook.com/ronginlibas.bd',
    currency: 'BDT',
    currencySymbol: '৳',
    dhakaDeliveryCharge: 80,
    outsideDhakaDeliveryCharge: 150,
    freeDeliveryThreshold: 3000,
    codEnabled: true,
    bkashEnabled: true,
    bkashWallet: '01711-223344',
    nagadEnabled: true,
    nagadWallet: '01822-554499',
    storeStatus: 'ACTIVE',
  };

  for (const [key, val] of Object.entries(settingsData)) {
    const stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
    await prisma.storeSetting.upsert({
      where: { key },
      update: { value: stringified },
      create: { key, value: stringified, group: 'store' },
    });
  }
  console.log('✓ Seeded Store Settings');

  console.log('Rongin Libas database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
