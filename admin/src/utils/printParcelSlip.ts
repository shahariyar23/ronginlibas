import { AdminOrder } from '@/data/adminData';

function generateBarcodeSvg(value: string): string {
  const cleanVal = (value || 'RL-PARCEL-001').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pattern = [2, 1, 3, 1, 1, 2, 3, 2];
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    pattern.push((code % 3) + 1.2);
    pattern.push(((code * 3) % 2) + 1);
    pattern.push(((code * 7) % 3) + 1.2);
    pattern.push(1);
  }
  pattern.push(3, 1, 2, 1, 3);

  let currentX = 0;
  const rects: string[] = [];
  pattern.forEach((width, index) => {
    if (index % 2 === 0) {
      rects.push(`<rect x="${currentX}" y="0" width="${width}" height="36" fill="#000000" />`);
    }
    currentX += width;
  });

  return `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <svg viewBox="0 0 ${currentX} 36" style="height:36px;width:100%;max-width:220px;" preserveAspectRatio="none">
        ${rects.join('')}
      </svg>
      <div style="font-family:monospace;font-size:10px;font-weight:bold;letter-spacing:2px;margin-top:2px;color:#000;">
        *${value}*
      </div>
    </div>
  `;
}

export function generateSlipHtml(order: AdminOrder): string {
  const isCod = order.paymentMethod === 'COD';
  const orderRef = order.orderNumber || order.id;
  const barcodeSvg = generateBarcodeSvg(orderRef);
  const division = (order.fullAddress?.division || 'DHAKA').toUpperCase();
  const addressLine1 = order.fullAddress?.addressLine1 || order.customerLocation;
  const addressLine2 = order.fullAddress?.addressLine2 || '';
  const cityLine = [order.fullAddress?.city, order.fullAddress?.division, 'Bangladesh']
    .filter(Boolean)
    .join(', ');
  const deliveryNotes = order.fullAddress?.deliveryInstructions || order.customerNotes || '';

  const itemsHtml =
    order.items && order.items.length > 0
      ? order.items
          .map(
            (item) => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; vertical-align: middle;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${
                item.image
                  ? `<img src="${item.image}" alt="" style="width: 44px; height: 52px; object-fit: cover; border: 1px solid #000; flex-shrink: 0;" />`
                  : `<div style="width: 44px; height: 52px; background: #eee; border: 1px solid #000; display:flex; align-items:center; justify-content:center; font-size:9px;">NO IMG</div>`
              }
              <div>
                <div style="font-weight: bold; font-size: 12px; color: #000;">${item.productName}</div>
                <div style="font-size: 10px; color: #444; margin-top: 2px;">
                  ${item.size ? `<span style="background: #f0f0f0; border: 1px solid #ccc; padding: 1px 4px; font-weight:bold; margin-right:4px;">Size: ${item.size}</span>` : ''}
                  ${item.color ? `<span style="background: #f0f0f0; border: 1px solid #ccc; padding: 1px 4px; margin-right:4px;">${item.color}</span>` : ''}
                  ${item.sku ? `<span style="font-family: monospace; color:#666;">SKU: ${item.sku}</span>` : ''}
                </div>
              </div>
            </div>
          </td>
          <td style="padding: 8px; text-align: center; font-family: monospace; font-weight: bold; font-size: 13px;">
            ${item.quantity}
          </td>
          <td style="padding: 8px; text-align: right; font-family: monospace; font-size: 12px;">
            ৳${item.unitPrice.toLocaleString()}
          </td>
          <td style="padding: 8px; text-align: right; font-family: monospace; font-weight: bold; font-size: 12px;">
            ৳${item.subtotal.toLocaleString()}
          </td>
        </tr>
      `
          )
          .join('')
      : `
        <tr>
          <td colspan="4" style="padding: 12px; text-align: center; color: #666; font-size: 12px;">
            ${order.itemsSummary || 'Standard Atelier Apparel Package'}
          </td>
        </tr>
      `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Parcel Shipping Label - ${orderRef}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.35;
      padding: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .parcel-card {
      border: 2px solid #000;
      padding: 18px;
      max-width: 780px;
      margin: 0 auto;
      background: #fff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .two-cols {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    .col-box {
      flex: 1;
      border: 2px solid #000;
      padding: 12px;
      background: #fff;
    }
    .cod-box {
      border: 2px solid #000;
      background: #fdfdfd;
      padding: 10px;
      text-align: center;
      margin-top: 8px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      margin-top: 6px;
    }
    .items-table th {
      background: #f0f0f0;
      border-bottom: 1px solid #000;
      padding: 6px 8px;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .cut-line {
      border-top: 2px dashed #000;
      margin: 14px 0;
      text-align: center;
      position: relative;
    }
    .cut-badge {
      position: relative;
      top: -9px;
      background: #fff;
      padding: 0 10px;
      font-size: 9px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .sign-table {
      width: 100%;
      margin-top: 14px;
      border-top: 1px solid #888;
      padding-top: 10px;
    }
    .sign-table td {
      width: 33.33%;
      vertical-align: top;
      padding-right: 10px;
    }
    .sign-line {
      border-bottom: 1px solid #000;
      height: 28px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="parcel-card">
    <!-- Header: Shipper & Barcode -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top; width: 55%;">
          <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; font-family: serif; color: #000;">
            RONGIN LIBAS
          </div>
          <div style="font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #333; margin-top: 1px;">
            Haute Couture Menswear • Dispatch Hub
          </div>
          <div style="font-size: 10px; color: #444; margin-top: 6px; line-height: 1.3;">
            <div><strong>Hotline:</strong> +880 1700-000000 | <strong>Email:</strong> orders@ronginlibas.com</div>
            <div><strong>Return Hub:</strong> House 12, Road 4, Sector 3, Uttara, Dhaka-1230</div>
          </div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 45%;">
          <div style="display: inline-block; background: #000; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 8px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            COURIER DISPATCH AIRWAY BILL
          </div>
          ${barcodeSvg}
          <div style="font-size: 10px; font-weight: bold; color: #333; margin-top: 4px;">
            Booked: ${order.dateStr} • ${order.timeDetail}
          </div>
          <div style="font-size: 9px; color: #666; text-transform: uppercase;">
            Carrier: Nationwide Express (24-48h TAT)
          </div>
        </td>
      </tr>
    </table>

    <!-- 2 Columns: Recipient & COD Collection -->
    <div class="two-cols">
      <!-- Recipient -->
      <div class="col-box">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 900; text-transform: uppercase;">
            DELIVER TO / CONSIGNEE:
          </span>
          <span style="font-size: 9px; font-weight: 900; background: #000; color: #fff; padding: 1px 6px;">
            ${division}
          </span>
        </div>

        <div style="font-size: 16px; font-weight: 900; text-transform: uppercase; color: #000;">
          ${order.customerName}
        </div>

        <!-- Giant Rider Contact Box -->
        <div style="background: #f4f4f4; border: 1px solid #000; padding: 6px 8px; margin: 6px 0;">
          <div style="font-size: 8px; font-weight: bold; text-transform: uppercase; color: #555;">
            Rider Call Contact (Direct Phone):
          </div>
          <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #000; letter-spacing: 1px;">
            📞 ${order.phone}
          </div>
        </div>

        <div style="font-size: 11px; line-height: 1.3; color: #000;">
          <div style="font-weight: bold; text-transform: uppercase;">${addressLine1}</div>
          ${addressLine2 ? `<div>${addressLine2}</div>` : ''}
          <div style="font-weight: 600; color: #333;">${cityLine}</div>
        </div>

        ${
          deliveryNotes
            ? `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #ccc; font-size: 10px; font-style: italic; color: #222;">
                <strong>Note:</strong> "${deliveryNotes}"
               </div>`
            : ''
        }
      </div>

      <!-- COD Collection -->
      <div class="col-box" style="background: #fafafa; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase;">
              PAYMENT & COD INSTRUCTION
            </span>
            <span style="font-size: 9px; font-weight: 900; border: 1px solid #000; padding: 1px 6px; ${isCod ? 'background:#000; color:#fff;' : 'background:#fff; color:#000;'}">
              ${isCod ? 'CASH ON DELIVERY' : 'ONLINE PREPAID'}
            </span>
          </div>

          <!-- Giant COD Box -->
          <div class="cod-box">
            <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #444;">
              COLLECT FROM RECIPIENT:
            </div>
            <div style="font-size: 28px; font-weight: 900; font-family: monospace; color: #000; margin: 4px 0;">
              ${isCod ? `৳ ${order.amount.toLocaleString()}` : '৳ 0.00 (PAID)'}
            </div>
            <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 4px; ${isCod ? 'background:#000; color:#fff;' : 'background:#eee; color:#000;'}">
              ${isCod ? '⚠️ Mandatory Cash Collection Prior to Handover' : '✅ Paid Online • Zero Cash Due'}
            </div>
          </div>
        </div>

        <div style="font-size: 9px; color: #444; border-top: 1px solid #ccc; padding-top: 6px; margin-top: 8px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between;">
            <span>Package Contents:</span>
            <strong style="color:#000;">Menswear Luxury Apparel</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Weight / Specs:</span>
            <strong style="color:#000;">&lt; 1.0 KG • Atelier Box</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Special Care:</span>
            <strong style="color:#000;">FRAGILE FABRICS • KEEP DRY</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Dotted Cut / Fold Line -->
    <div class="cut-line">
      <span class="cut-badge">
        ✂ FOLD OR DETACH ALONG THIS DOTTED LINE TO ATTACH TO PARCEL POUCH ✂
      </span>
    </div>

    <!-- Consignment Manifest -->
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
      <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
        CONSIGNMENT PACKING MANIFEST (${order.itemCount || 1} Total Units)
      </div>
      <div style="font-family: monospace; font-size: 10px; color: #666;">
        REF: ${orderRef}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: left; width: 55%;">Garment Description & Specs</th>
          <th style="text-align: center; width: 15%;">Qty</th>
          <th style="text-align: right; width: 15%;">Unit Price</th>
          <th style="text-align: right; width: 15%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Financial Breakdown -->
    <table style="width: 100%; margin-top: 8px; font-size: 11px;">
      <tr>
        <td style="width: 60%; vertical-align: top; color: #666; font-size: 10px;">
          Includes authentic artisan tailoring, taxes, and luxury packaging.
        </td>
        <td style="width: 40%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 0; color: #555;">Items Subtotal:</td>
              <td style="padding: 2px 0; text-align: right; font-family: monospace; font-weight: bold;">
                ৳${(order.subtotal || order.amount).toLocaleString()}
              </td>
            </tr>
            ${
              order.discountAmount && order.discountAmount > 0
                ? `<tr>
                    <td style="padding: 2px 0; color: #888;">Discount / Voucher:</td>
                    <td style="padding: 2px 0; text-align: right; font-family: monospace; font-weight: bold;">
                      -৳${order.discountAmount.toLocaleString()}
                    </td>
                   </tr>`
                : ''
            }
            <tr>
              <td style="padding: 2px 0; color: #555;">Express Delivery Charge:</td>
              <td style="padding: 2px 0; text-align: right; font-family: monospace; font-weight: bold;">
                ${order.deliveryCharge === 0 ? 'FREE' : `৳${(order.deliveryCharge || 80).toLocaleString()}`}
              </td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="padding: 4px 0; font-size: 13px; font-weight: 900; text-transform: uppercase;">
                TOTAL PAYABLE:
              </td>
              <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 16px; font-weight: 900;">
                ৳${order.amount.toLocaleString()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Signature Block -->
    <table class="sign-table">
      <tr>
        <td>
          <div class="sign-line"></div>
          <div style="font-size: 9px; font-weight: bold; text-transform: uppercase;">1. Packed & QC By</div>
          <div style="font-size: 8px; color: #666;">Rongin Libas Atelier Floor</div>
        </td>
        <td>
          <div class="sign-line"></div>
          <div style="font-size: 9px; font-weight: bold; text-transform: uppercase;">2. Picked Up By</div>
          <div style="font-size: 8px; color: #666;">Courier / QSR Rider Sign & ID</div>
        </td>
        <td>
          <div class="sign-line"></div>
          <div style="font-size: 9px; font-weight: bold; text-transform: uppercase;">3. Received In Good Order</div>
          <div style="font-size: 8px; color: #666;">Customer Handover / OTP Verified</div>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 10px; font-size: 8px; color: #666; border-top: 1px solid #eee; padding-top: 6px;">
      Notice: If undelivered within 48h, please return to Rongin Libas Dispatch Hub, Dhaka-1230. Hotline: +880 1700-000000.
    </div>
  </div>
</body>
</html>`;
}

export function printParcelSlip(order: AdminOrder): void {
  let iframe = document.getElementById('parcel-print-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'parcel-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);
  }

  const html = generateSlipHtml(order);
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback to window print
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Give a small delay to ensure rendering is complete before opening print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 300);
}
