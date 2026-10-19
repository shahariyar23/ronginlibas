export interface InvoiceTemplateItem {
  productName: string;
  size?: string | null;
  color?: string | null;
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  thumbnailBase64?: string | null;
  imageUrl?: string | null;
}

export interface InvoiceTemplateData {
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  orderStatus: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string | null;
  deliveryMethod: string;
  deliveryStatus?: string | null;
  items: InvoiceTemplateItem[];
  itemsSubtotal: number;
  discountAmount?: number;
  deliveryCharge?: number;
  grandTotal: number;
  logoBase64?: string;
}

export function renderInvoiceHtml(data: InvoiceTemplateData): string {
  const {
    invoiceNumber,
    orderNumber,
    issueDate,
    orderStatus,
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    transactionId,
    deliveryMethod,
    deliveryStatus,
    items = [],
    itemsSubtotal = 0,
    discountAmount = 0,
    deliveryCharge = 0,
    grandTotal = 0,
    logoBase64 = '',
  } = data;

  const isPaid = (paymentStatus || '').toLowerCase().includes('paid');
  const paymentBadgeBg = isPaid ? '#16a34a' : '#d97706';

  const isConfirmed = ['confirmed', 'delivered', 'completed', 'shipped'].includes(
    (orderStatus || '').toLowerCase(),
  );
  const statusBadgeBg = isConfirmed ? '#16a34a' : '#2563eb';

  const rowsHtml = items
    .map((item, index) => {
      const itemNumber = index + 1;
      const title = item.productName || 'Product';
      const size = item.size ? `<span class="badge-tag">Size: ${escapeHtml(item.size)}</span>` : '';
      const color = item.color ? `<span class="badge-tag">Color: ${escapeHtml(item.color)}</span>` : '';
      const sku = item.sku ? `<div class="product-sku">SKU: ${escapeHtml(item.sku)}</div>` : '';
      const unitPrice = Number(item.unitPrice || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = Number(item.lineTotal ?? unitPrice * quantity);

      const imageSrc = item.thumbnailBase64 || item.imageUrl;
      const imageHtml = imageSrc
        ? `<img src="${imageSrc}" class="product-thumb" alt="${escapeHtml(title)}" />`
        : `<div class="product-thumb-fallback">RL</div>`;

      return `
        <tr class="product-row">
          <td class="col-num">${itemNumber}</td>
          <td class="col-details">
            <div class="product-details-wrap">
              ${imageHtml}
              <div class="product-info">
                <div class="product-name">${escapeHtml(title)}</div>
                <div class="product-variants">
                  ${size}
                  ${color}
                </div>
                ${sku}
              </div>
            </div>
          </td>
          <td class="col-price">BDT ${unitPrice.toLocaleString('en-US')}</td>
          <td class="col-qty">${quantity} ${quantity === 1 ? 'pc' : 'pcs'}</td>
          <td class="col-total">BDT ${lineTotal.toLocaleString('en-US')}</td>
        </tr>
      `;
    })
    .join('');

  const discountRowHtml =
    discountAmount && discountAmount > 0
      ? `
        <div class="summary-row discount-row">
          <span class="summary-label">Discount</span>
          <span class="summary-val">- BDT ${discountAmount.toLocaleString('en-US')}</span>
        </div>
      `
      : '';

  const deliveryDisplay =
    deliveryCharge === 0 || Number(deliveryCharge) === 0
      ? 'FREE'
      : `BDT ${Number(deliveryCharge).toLocaleString('en-US')}`;

  const transactionRowHtml =
    transactionId && transactionId.trim().length > 0
      ? `
        <div class="card-row">
          <span class="card-label">Transaction ID</span>
          <span class="card-sep">:</span>
          <span class="card-val font-mono">${escapeHtml(transactionId)}</span>
        </div>
      `
      : '';

  const deliveryStatusHtml =
    deliveryStatus && deliveryStatus.trim().length > 0
      ? `
        <div class="card-row">
          <span class="card-label">Delivery Status</span>
          <span class="card-sep">:</span>
          <span class="card-val"><span class="badge status-pill">${escapeHtml(deliveryStatus)}</span></span>
        </div>
      `
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${escapeHtml(invoiceNumber)} - Rongin Libas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm 10mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f8f7f2;
      color: #1f2937;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-wrapper {
      position: relative;
      width: 100%;
    }

    /* Top Corner Watermark */
    .top-watermark {
      position: absolute;
      top: -8mm;
      right: -12mm;
      width: 140px;
      height: 140px;
      opacity: 0.16;
      pointer-events: none;
      z-index: 0;
    }

    /* Header */
    .invoice-header {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8e6dc;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-img {
      width: 58px;
      height: 54px;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
      font-size: 23px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #073a2d;
      line-height: 1.1;
    }
    .brand-tagline {
      font-size: 7.5px;
      font-weight: 600;
      letter-spacing: 3.5px;
      color: #4b5563;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .meta-section {
      text-align: right;
    }
    .meta-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #073a2d;
      margin-bottom: 5px;
      line-height: 1;
    }
    .meta-table {
      margin-left: auto;
      border-collapse: collapse;
      font-size: 11px;
    }
    .meta-table td {
      padding: 1.5px 3px;
      vertical-align: middle;
    }
    .meta-label {
      color: #4b5563;
      text-align: left;
    }
    .meta-sep {
      color: #9ca3af;
      padding: 0 4px;
    }
    .meta-val {
      font-weight: 600;
      color: #111827;
      text-align: left;
    }

    /* Pill Badges */
    .badge {
      display: inline-block;
      padding: 2.5px 10px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      line-height: 1.2;
    }
    .badge-confirmed {
      background-color: ${statusBadgeBg};
    }
    .badge-paid {
      background-color: ${paymentBadgeBg};
    }
    .status-pill {
      background-color: #d97706;
    }

    /* Two Information Cards */
    .cards-row {
      display: flex;
      gap: 14px;
      margin-top: 12px;
      margin-bottom: 14px;
    }
    .info-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 14px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.6px;
      color: #073a2d;
      text-transform: uppercase;
      padding-bottom: 7px;
      margin-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
    .card-header svg {
      width: 14px;
      height: 14px;
      stroke: #073a2d;
      stroke-width: 2;
    }
    .customer-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 3px;
    }
    .customer-phone {
      font-size: 11px;
      color: #374151;
      margin-bottom: 6px;
    }
    .address-label {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .address-content {
      font-size: 11px;
      color: #1f2937;
      line-height: 1.4;
      word-break: break-word;
    }

    .card-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-size: 11px;
    }
    .card-row:last-child {
      margin-bottom: 0;
    }
    .card-label {
      width: 110px;
      color: #4b5563;
      flex-shrink: 0;
    }
    .card-sep {
      width: 12px;
      color: #9ca3af;
      flex-shrink: 0;
    }
    .card-val {
      font-weight: 600;
      color: #111827;
      flex-grow: 1;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 0.5px;
    }

    /* Product Table */
    .table-container {
      width: 100%;
      margin-bottom: 14px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      background: #ffffff;
    }
    table.product-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    table.product-table thead {
      display: table-header-group;
      background-color: #073a2d;
    }
    table.product-table thead th {
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      padding: 9px 10px;
    }
    .col-num {
      width: 5%;
      text-align: center;
    }
    .col-details {
      width: 51%;
      text-align: left;
    }
    .col-price {
      width: 15%;
      text-align: center;
    }
    .col-qty {
      width: 12%;
      text-align: center;
    }
    .col-total {
      width: 17%;
      text-align: right;
      padding-right: 14px !important;
    }

    tr.product-row {
      background: #ffffff;
      border-bottom: 1px solid #f3f4f6;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    tr.product-row:last-child {
      border-bottom: none;
    }
    tr.product-row td {
      padding: 7px 10px;
      vertical-align: middle;
    }
    .product-details-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .product-thumb {
      width: 46px;
      height: 46px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #e5e7eb;
      flex-shrink: 0;
      background-color: #f9fafb;
    }
    .product-thumb-fallback {
      width: 46px;
      height: 46px;
      border-radius: 6px;
      border: 1px solid #d1fae5;
      background-color: #ecfdf5;
      color: #073a2d;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 1px;
      flex-shrink: 0;
    }
    .product-info {
      flex-grow: 1;
    }
    .product-name {
      font-size: 11.5px;
      font-weight: 700;
      color: #111827;
      line-height: 1.3;
      margin-bottom: 2px;
    }
    .product-variants {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }
    .badge-tag {
      display: inline-block;
      font-size: 8.5px;
      color: #374151;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 1px 5px;
    }
    .product-sku {
      font-size: 8.5px;
      color: #6b7280;
      margin-top: 2px;
    }
    .col-price {
      font-weight: 500;
      color: #1f2937;
    }
    .col-qty {
      color: #4b5563;
    }
    .col-total {
      font-weight: 700;
      color: #073a2d;
    }

    /* Last Page Section (Keeps totals, thank you, highlights, and footer together) */
    .last-page-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-top: 6px;
    }

    .totals-and-thankyou {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 14px;
    }

    /* Left: Thank you & appreciation */
    .thankyou-box {
      flex: 1;
      max-width: 52%;
    }
    .thankyou-heading-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }
    .thankyou-title {
      font-family: 'Caveat', 'Brush Script MT', cursive;
      font-size: 34px;
      font-weight: 700;
      color: #073a2d;
      line-height: 1;
    }
    .thankyou-heart {
      width: 20px;
      height: 20px;
      stroke: #c79a45;
      stroke-width: 2;
      fill: none;
    }
    .thankyou-sub {
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #4b5563;
      text-transform: uppercase;
    }
    .thankyou-brand {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #073a2d;
      text-transform: uppercase;
      margin-top: 2px;
      margin-bottom: 8px;
    }
    .appreciation-card {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-radius: 8px;
      padding: 7px 11px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .appreciation-card svg {
      width: 18px;
      height: 18px;
      stroke: #16a34a;
      flex-shrink: 0;
    }
    .appreciation-text {
      font-size: 9px;
      color: #166534;
      line-height: 1.35;
      font-weight: 500;
    }

    /* Right: Order Totals */
    .order-summary {
      width: 250px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 9px 14px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3.5px 0;
      font-size: 11px;
    }
    .summary-label {
      color: #4b5563;
    }
    .summary-val {
      font-weight: 600;
      color: #111827;
    }
    .discount-row {
      color: #dc2626;
    }
    .discount-row .summary-label, .discount-row .summary-val {
      color: #dc2626;
    }
    .total-amount-row {
      margin-top: 5px;
      padding: 6px 10px;
      background-color: #e6f4ea;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-amount-label {
      font-size: 12px;
      font-weight: 800;
      color: #073a2d;
    }
    .total-amount-val {
      font-size: 14px;
      font-weight: 800;
      color: #073a2d;
    }

    /* Service Highlights Grid */
    .service-highlights {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 8px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .service-item {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 1;
    }
    .service-icon-wrap {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: #f0fdf4;
      border: 1px solid #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .service-icon-wrap svg {
      width: 13px;
      height: 13px;
      stroke: #073a2d;
      stroke-width: 2.2;
    }
    .service-text {
      display: flex;
      flex-direction: column;
    }
    .service-title {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #073a2d;
      line-height: 1.2;
    }
    .service-sub {
      font-size: 8px;
      color: #6b7280;
      line-height: 1.2;
      margin-top: 1px;
    }

    /* Bottom Decorative Wave Footer */
    .footer-wave-wrap {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background-color: #073a2d;
      color: #ffffff;
      padding: 9px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      border-top: 2px solid #c79a45;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-logo-img {
      height: 20px;
      width: auto;
      object-fit: contain;
      background-color: #ffffff;
      border-radius: 3px;
      padding: 1px 3px;
    }
    .footer-brand-title {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #fbf9f2;
      text-transform: uppercase;
      line-height: 1;
    }
    .footer-links-group {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .footer-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 500;
      text-decoration: none;
      letter-spacing: 0.4px;
      cursor: pointer;
    }
    .footer-link svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Top Decorative Watermark -->
    <svg class="top-watermark" viewBox="0 0 100 100" fill="none">
      <circle cx="80" cy="20" r="60" stroke="#c79a45" stroke-width="1.5" />
      <circle cx="90" cy="10" r="45" stroke="#073a2d" stroke-width="1" />
      <path d="M40 0 C60 40, 80 60, 100 80" stroke="#c79a45" stroke-width="1" />
    </svg>

    <!-- INVOICE HEADER -->
    <div class="invoice-header">
      <div class="brand-section">
        <img src="${logoBase64}" class="brand-logo-img" alt="Rongin Libas" />
        <div class="brand-text">
          <div class="brand-name">RONGIN LIBAS</div>
          <div class="brand-tagline">CLOTH YOUR IDENTITY</div>
        </div>
      </div>

      <div class="meta-section">
        <div class="meta-title">INVOICE</div>
        <table class="meta-table">
          <tr>
            <td class="meta-label">Invoice No</td>
            <td class="meta-sep">:</td>
            <td class="meta-val">${escapeHtml(invoiceNumber)}</td>
          </tr>
          <tr>
            <td class="meta-label">Order No</td>
            <td class="meta-sep">:</td>
            <td class="meta-val">${escapeHtml(orderNumber)}</td>
          </tr>
          <tr>
            <td class="meta-label">Issue Date</td>
            <td class="meta-sep">:</td>
            <td class="meta-val">${escapeHtml(issueDate)}</td>
          </tr>
          <tr>
            <td class="meta-label">Order Status</td>
            <td class="meta-sep">:</td>
            <td class="meta-val"><span class="badge badge-confirmed">${escapeHtml(orderStatus)}</span></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- CUSTOMER & PAYMENT CARDS -->
    <div class="cards-row">
      <!-- SOLD TO -->
      <div class="info-card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>SOLD TO</span>
        </div>
        <div class="customer-name">${escapeHtml(customerName)}</div>
        <div class="customer-phone">Phone: ${escapeHtml(customerPhone)}</div>
        <div class="address-label">Delivery Address:</div>
        <div class="address-content">${escapeHtml(deliveryAddress)}</div>
      </div>

      <!-- PAYMENT & DELIVERY -->
      <div class="info-card">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>PAYMENT & DELIVERY</span>
        </div>
        <div class="card-row">
          <span class="card-label">Payment Method</span>
          <span class="card-sep">:</span>
          <span class="card-val">${escapeHtml(paymentMethod)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Payment Status</span>
          <span class="card-sep">:</span>
          <span class="card-val"><span class="badge badge-paid">${escapeHtml(paymentStatus)}</span></span>
        </div>
        ${transactionRowHtml}
        <div class="card-row">
          <span class="card-label">Delivery Method</span>
          <span class="card-sep">:</span>
          <span class="card-val">${escapeHtml(deliveryMethod)}</span>
        </div>
        ${deliveryStatusHtml}
      </div>
    </div>

    <!-- PRODUCT TABLE -->
    <div class="table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-details">PRODUCT DETAILS</th>
            <th class="col-price">UNIT PRICE</th>
            <th class="col-qty">QTY</th>
            <th class="col-total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <!-- LAST-PAGE-ONLY FOOTER SECTION -->
    <div class="last-page-section">
      <!-- TOTALS & THANK YOU -->
      <div class="totals-and-thankyou">
        <div class="thankyou-box">
          <div class="thankyou-heading-wrap">
            <span class="thankyou-title">Thank You</span>
            <svg class="thankyou-heart" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div class="thankyou-sub">FOR SHOPPING WITH</div>
          <div class="thankyou-brand">RONGIN LIBAS</div>
          <div class="appreciation-card">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <div class="appreciation-text">
              We appreciate your trust and support.<br>
              Your style inspires us!
            </div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">Items Subtotal</span>
            <span class="summary-val">BDT ${itemsSubtotal.toLocaleString('en-US')}</span>
          </div>
          ${discountRowHtml}
          <div class="summary-row">
            <span class="summary-label">Packaging & Delivery</span>
            <span class="summary-val">${deliveryDisplay}</span>
          </div>
          <div class="total-amount-row">
            <span class="total-amount-label">Total Amount</span>
            <span class="total-amount-val">BDT ${grandTotal.toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>

      <!-- SERVICE HIGHLIGHTS (4 COLUMNS) -->
      <div class="service-highlights">
        <!-- 1. AUTHENTIC PRODUCTS -->
        <div class="service-item">
          <div class="service-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div class="service-text">
            <span class="service-title">AUTHENTIC PRODUCTS</span>
            <span class="service-sub">Premium quality garments</span>
          </div>
        </div>

        <!-- 2. FAST & RELIABLE DELIVERY -->
        <div class="service-item">
          <div class="service-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div class="service-text">
            <span class="service-title">FAST & RELIABLE DELIVERY</span>
            <span class="service-sub">24-48 hours doorstep</span>
          </div>
        </div>

        <!-- 3. EASY EXCHANGE -->
        <div class="service-item">
          <div class="service-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </div>
          <div class="service-text">
            <span class="service-title">EASY EXCHANGE</span>
            <span class="service-sub">2-day hassle-free</span>
          </div>
        </div>

        <!-- 4. CUSTOMER SUPPORT -->
        <div class="service-item">
          <div class="service-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <div class="service-text">
            <span class="service-title">CUSTOMER SUPPORT</span>
            <span class="service-sub">WhatsApp: 01352926067</span>
          </div>
        </div>
      </div>

      <!-- FOOTER WAVE BANNER -->
      <div class="footer-wave-wrap">
        ${logoBase64 ? `
        <div class="footer-brand">
          <img src="${logoBase64}" class="footer-logo-img" alt="Rongin Libas" />
          <span class="footer-brand-title">Rongin Libas</span>
        </div>
        ` : ''}
        <div class="footer-links-group">
          <a href="https://facebook.com/ronginlibas" target="_blank" rel="noopener noreferrer" class="footer-link">
            <svg viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>facebook.com/ronginlibas</span>
          </a>
          <a href="https://www.ronginlibas.com" target="_blank" rel="noopener noreferrer" class="footer-link">
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.2 2.08c-3.79.48-6.84 3.32-7.58 7.02h3.44c.48-2.6 1.94-5.22 4.14-7.02zm2.4 0c2.2 1.8 3.66 4.42 4.14 7.02h3.44c-.74-3.7-3.79-6.54-7.58-7.02zM12 4.38c-1.57 1.84-2.66 4.13-2.93 6.72h5.86c-.27-2.59-1.36-4.88-2.93-6.72zM2.82 13.1c.74 3.7 3.79 6.54 7.58 7.02-2.2-1.8-3.66-4.42-4.14-7.02H2.82zm8.28 6.52c1.57-1.84 2.66-4.13 2.93-6.72H9.17c.27 2.59 1.36 4.88 2.93 6.72zm2.5-6.52c-.48 2.6-1.94 5.22-4.14 7.02 3.79-.48 6.84-3.32 7.58-7.02h-3.44z"/>
            </svg>
            <span>www.ronginlibas.com</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
