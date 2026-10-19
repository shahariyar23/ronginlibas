import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import {
  renderInvoiceHtml,
  InvoiceTemplateData,
  InvoiceTemplateItem,
} from '../templates/invoice.template.js';

const __moduleFilename = fileURLToPath(import.meta.url);
const __moduleDirname = path.dirname(__moduleFilename);

let cachedLogoBase64: string | null = null;

export function getLogoBase64(): string {
  if (cachedLogoBase64) return cachedLogoBase64;
  const svgCandidates = [
    path.resolve(__moduleDirname, '../../assets/logo.svg'),
    path.resolve(__moduleDirname, '../../../src/assets/logo.svg'),
    path.resolve(process.cwd(), 'src/assets/logo.svg'),
    path.resolve(process.cwd(), 'dist/assets/logo.svg'),
    path.resolve(process.cwd(), 'server/src/assets/logo.svg'),
    path.resolve(process.cwd(), 'public/logo.svg'),
    path.resolve(process.cwd(), 'web/public/logo.svg'),
  ];
  for (const p of svgCandidates) {
    if (fs.existsSync(p)) {
      try {
        const svgBuf = fs.readFileSync(p);
        cachedLogoBase64 = `data:image/svg+xml;base64,${svgBuf.toString('base64')}`;
        return cachedLogoBase64;
      } catch {
        // continue
      }
    }
  }

  const pngCandidates = [
    path.resolve(__moduleDirname, '../../assets/logo.png'),
    path.resolve(__moduleDirname, '../../../src/assets/logo.png'),
    path.resolve(process.cwd(), 'src/assets/logo.png'),
    path.resolve(process.cwd(), 'dist/assets/logo.png'),
    path.resolve(process.cwd(), 'server/src/assets/logo.png'),
    path.resolve(process.cwd(), 'public/logo.png'),
    path.resolve(process.cwd(), 'web/public/logo.png'),
  ];
  for (const p of pngCandidates) {
    if (fs.existsSync(p)) {
      try {
        const pngBuf = fs.readFileSync(p);
        cachedLogoBase64 = `data:image/png;base64,${pngBuf.toString('base64')}`;
        return cachedLogoBase64;
      } catch {
        // continue
      }
    }
  }

  return '';
}

export function getChromeExecutablePath(): string {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return '/usr/bin/google-chrome';
}

export async function fetchThumbnailBase64(rawUrl?: string | null): Promise<string | null> {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Handle local filesystem files if specified
  if (trimmed.startsWith('/') || trimmed.startsWith('file://')) {
    try {
      const filePath = trimmed.replace(/^file:\/\//, '');
      if (fs.existsSync(filePath)) {
        const fileBuf = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mime =
          ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : ext === '.svg'
                ? 'image/svg+xml'
                : 'image/jpeg';
        return `data:${mime};base64,${fileBuf.toString('base64')}`;
      }
    } catch {
      // Continue to remote fetch
    }
  }

  try {
    let url = trimmed;
    if (url.includes('/image/upload/')) {
      url = url.replace('/image/upload/', '/image/upload/f_jpg,w_100,h_100,c_fill/');
    }

    let res: Response | null = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
    } catch {
      res = null;
    }

    // If transformed url failed or returned error status, fallback to rawUrl
    if (!res || !res.ok) {
      if (url !== trimmed) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          res = await fetch(trimmed, { signal: controller.signal });
          clearTimeout(timeout);
        } catch {
          res = null;
        }
      }
    }

    if (!res || !res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    if (!buf || buf.length === 0) return null;

    let mime = 'image/jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      mime = 'image/png';
    } else if (
      (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) ||
      (buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP')
    ) {
      mime = 'image/webp';
    } else if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
      mime = 'image/gif';
    } else if (buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
      mime = 'image/avif';
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      mime = 'image/jpeg';
    } else {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        mime = ct.split(';')[0].trim();
      }
    }

    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export function formatInvoiceIssueDate(dateInput: Date | string): string {
  try {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function generateInvoicePdf(order: any, invoice?: any): Promise<Buffer> {
  const invoiceRecord = invoice || order.invoice;
  const invoiceNumber = invoiceRecord?.invoiceNumber || order.orderNumber;
  const orderNumber = order.orderNumber
    ? order.orderNumber.startsWith('#')
      ? order.orderNumber
      : `#${order.orderNumber}`
    : `#RL${Date.now()}`;
  const issueDate = formatInvoiceIssueDate(
    invoiceRecord?.issuedAt || order.createdAt || new Date(),
  );

  const rawStatus = (order.status || 'CONFIRMED').toString();
  const orderStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  // Extract Customer / Shipping Details
  const addr =
    (invoiceRecord?.shippingAddress as Record<string, any>) ||
    (order.shippingAddress as Record<string, any>) ||
    {};
  const customerName =
    invoiceRecord?.customerName ||
    addr.fullName ||
    addr.recipient ||
    addr.name ||
    (order.customer
      ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
      : order.guestName) ||
    'Valued Patron';

  const customerPhone =
    invoiceRecord?.customerPhone ||
    addr.phone ||
    order.guestPhone ||
    order.customer?.phone ||
    '';

  const deliveryAddress =
    [
      addr.addressLine1 || addr.address,
      addr.addressLine2,
      addr.city,
      addr.division,
      addr.postalCode,
    ]
      .filter(Boolean)
      .join(', ') || 'Doorstep Delivery Location';

  // Payment details
  const rawMethod = (order.paymentMethod || '').toString().toUpperCase();
  let paymentMethod = 'Cash on Delivery (COD)';
  if (
    rawMethod.includes('UDDOKTA') ||
    rawMethod.includes('GATEWAY') ||
    rawMethod.includes('DIGITAL')
  ) {
    paymentMethod = 'UDDOKTAPAY (Digital Gateway)';
  } else if (rawMethod.includes('BKASH')) {
    paymentMethod = 'bKash (Mobile Banking)';
  } else if (rawMethod.includes('NAGAD')) {
    paymentMethod = 'Nagad (Mobile Banking)';
  } else if (rawMethod.includes('COD') || rawMethod.includes('CASH')) {
    paymentMethod = 'Cash on Delivery (COD)';
  } else if (order.paymentMethod) {
    paymentMethod = order.paymentMethod;
  }

  const rawPaymentStatus = (order.paymentStatus || '').toString().toUpperCase();
  let paymentStatus = 'Pending';
  if (
    rawPaymentStatus === 'PAID' ||
    rawPaymentStatus === 'COMPLETED' ||
    rawPaymentStatus === 'FULL'
  ) {
    paymentStatus = 'Paid in Full';
  } else if (rawPaymentStatus === 'PARTIAL' || rawPaymentStatus === 'PARTIALLY_PAID') {
    paymentStatus = 'Partially Paid';
  } else if (rawPaymentStatus === 'FAILED') {
    paymentStatus = 'Failed';
  } else if (rawPaymentStatus === 'REFUNDED') {
    paymentStatus = 'Refunded';
  } else if (order.paymentStatus) {
    paymentStatus =
      order.paymentStatus.charAt(0).toUpperCase() +
      order.paymentStatus.slice(1).toLowerCase();
  }

  const transactionId =
    invoiceRecord?.payments?.[0]?.providerTransactionId ||
    invoiceRecord?.payments?.[0]?.providerOrderId ||
    (order.payments && order.payments[0]?.providerTransactionId) ||
    (order.payments && order.payments[0]?.providerOrderId) ||
    (order.paymentDetails as any)?.transactionId ||
    (order.paymentDetails as any)?.trx_id ||
    (order.paymentDetails as any)?.transaction_id ||
    '';

  const deliveryMethod =
    order.deliveryMethod ||
    (order.shippingMethod as any)?.name ||
    'Express (24-48 Hours)';

  let deliveryStatus = '';
  if (order.deliveryStatus) {
    deliveryStatus = order.deliveryStatus;
  } else if (order.trackingStatus) {
    deliveryStatus = order.trackingStatus;
  } else if (rawStatus === 'SHIPPED' || rawStatus === 'OUT_FOR_DELIVERY') {
    deliveryStatus = 'On the Way';
  } else if (rawStatus === 'DELIVERED') {
    deliveryStatus = 'Delivered';
  } else if (rawStatus === 'CONFIRMED' || rawStatus === 'PROCESSING') {
    deliveryStatus = 'Processing';
  }

  // Preload items and images in parallel
  const invoiceItems =
    invoiceRecord?.items && invoiceRecord.items.length > 0
      ? invoiceRecord.items
      : order.items || [];

  const items: InvoiceTemplateItem[] = await Promise.all(
    invoiceItems.map(async (item: any, idx: number) => {
      // Find matching item in order.items if item itself lacks image
      const orderItem =
        (order.items || []).find(
          (oi: any) =>
            (oi.sku && item.sku && oi.sku === item.sku) ||
            (oi.variantId && item.productVariantId && oi.variantId === item.productVariantId) ||
            (oi.productId && item.productId && oi.productId === item.productId && oi.size === item.size) ||
            (oi.productName && item.productName && oi.productName === item.productName),
        ) || order.items?.[idx];

      const imgUrl =
        item.productImage ||
        item.thumbnailUrl ||
        item.imageUrl ||
        item.product?.images?.[0]?.url ||
        orderItem?.productImage ||
        orderItem?.thumbnailUrl ||
        orderItem?.imageUrl ||
        orderItem?.product?.images?.[0]?.url ||
        null;

      const thumbnailBase64 = await fetchThumbnailBase64(imgUrl);
      const unitPrice = Number(item.unitPrice || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = Number(item.lineTotal ?? item.subtotal ?? unitPrice * quantity);

      return {
        productName: item.productName || item.product?.name || orderItem?.productName || 'Product',
        size: item.size || orderItem?.size || null,
        color: item.color || orderItem?.color || null,
        sku: item.sku || orderItem?.sku || null,
        unitPrice,
        quantity,
        lineTotal,
        thumbnailBase64,
        imageUrl: imgUrl,
      };
    }),
  );

  const itemsSubtotal = Number(
    order.subtotal ?? items.reduce((acc, it) => acc + it.lineTotal, 0),
  );
  const discountAmount = Number(order.discountAmount || 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const grandTotal = Number(order.totalAmount);

  const logoBase64 = getLogoBase64();

  const templateData: InvoiceTemplateData = {
    invoiceNumber,
    orderNumber,
    issueDate,
    orderStatus,
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    transactionId: transactionId || null,
    deliveryMethod,
    deliveryStatus: deliveryStatus || null,
    items,
    itemsSubtotal,
    discountAmount,
    deliveryCharge,
    grandTotal,
    logoBase64,
  };

  const html = renderInvoiceHtml(templateData);

  const browser = await puppeteer.launch({
    executablePath: getChromeExecutablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=medium',
    ],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '8mm',
        right: '12mm',
        bottom: '10mm',
        left: '12mm',
      },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
