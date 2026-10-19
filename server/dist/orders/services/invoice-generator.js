import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import PDFDocument from 'pdfkit';
import { renderInvoiceHtml, } from '../templates/invoice.template.js';
const __moduleFilename = fileURLToPath(import.meta.url);
const __moduleDirname = path.dirname(__moduleFilename);
let cachedLogoBase64 = null;
export function getLogoBase64() {
    if (cachedLogoBase64)
        return cachedLogoBase64;
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
            }
            catch {
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
            }
            catch {
            }
        }
    }
    return '';
}
let cachedLogoBuffer = null;
export function getLogoBuffer() {
    if (cachedLogoBuffer)
        return cachedLogoBuffer;
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
                cachedLogoBuffer = fs.readFileSync(p);
                return cachedLogoBuffer;
            }
            catch {
            }
        }
    }
    return null;
}
export function getChromeExecutablePath() {
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (envPath && fs.existsSync(envPath))
        return envPath;
    const candidates = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ];
    for (const c of candidates) {
        if (fs.existsSync(c))
            return c;
    }
    return '/usr/bin/google-chrome';
}
export async function fetchThumbnailBase64(rawUrl) {
    if (!rawUrl)
        return null;
    const trimmed = rawUrl.trim();
    if (!trimmed)
        return null;
    if (trimmed.startsWith('data:image/')) {
        return trimmed;
    }
    if (trimmed.startsWith('/') || trimmed.startsWith('file://')) {
        try {
            const filePath = trimmed.replace(/^file:\/\//, '');
            if (fs.existsSync(filePath)) {
                const fileBuf = fs.readFileSync(filePath);
                const ext = path.extname(filePath).toLowerCase();
                const mime = ext === '.png'
                    ? 'image/png'
                    : ext === '.webp'
                        ? 'image/webp'
                        : ext === '.svg'
                            ? 'image/svg+xml'
                            : 'image/jpeg';
                return `data:${mime};base64,${fileBuf.toString('base64')}`;
            }
        }
        catch {
        }
    }
    try {
        let url = trimmed;
        if (url.includes('/image/upload/')) {
            url = url.replace('/image/upload/', '/image/upload/f_jpg,w_100,h_100,c_fill/');
        }
        let res = null;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
        }
        catch {
            res = null;
        }
        if (!res || !res.ok) {
            if (url !== trimmed) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 6000);
                    res = await fetch(trimmed, { signal: controller.signal });
                    clearTimeout(timeout);
                }
                catch {
                    res = null;
                }
            }
        }
        if (!res || !res.ok)
            return null;
        const arrayBuffer = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuffer);
        if (!buf || buf.length === 0)
            return null;
        let mime = 'image/jpeg';
        if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
            mime = 'image/png';
        }
        else if ((buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) ||
            (buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP')) {
            mime = 'image/webp';
        }
        else if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
            mime = 'image/gif';
        }
        else if (buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
            mime = 'image/avif';
        }
        else if (buf[0] === 0xff && buf[1] === 0xd8) {
            mime = 'image/jpeg';
        }
        else {
            const ct = res.headers.get('content-type') || '';
            if (ct.startsWith('image/')) {
                mime = ct.split(';')[0].trim();
            }
        }
        return `data:${mime};base64,${buf.toString('base64')}`;
    }
    catch {
        return null;
    }
}
export function formatInvoiceIssueDate(dateInput) {
    try {
        const d = new Date(dateInput);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(d);
    }
    catch {
        return new Date().toISOString().slice(0, 10);
    }
}
export async function generateInvoicePdf(order, invoice) {
    const invoiceRecord = invoice || order.invoice;
    const invoiceNumber = invoiceRecord?.invoiceNumber || order.orderNumber;
    const orderNumber = order.orderNumber
        ? order.orderNumber.startsWith('#')
            ? order.orderNumber
            : `#${order.orderNumber}`
        : `#RL${Date.now()}`;
    const issueDate = formatInvoiceIssueDate(invoiceRecord?.issuedAt || order.createdAt || new Date());
    const rawStatus = (order.status || 'CONFIRMED').toString();
    const orderStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    const addr = invoiceRecord?.shippingAddress ||
        order.shippingAddress ||
        {};
    const customerName = invoiceRecord?.customerName ||
        addr.fullName ||
        addr.recipient ||
        addr.name ||
        (order.customer
            ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
            : order.guestName) ||
        'Valued Patron';
    const customerPhone = invoiceRecord?.customerPhone ||
        addr.phone ||
        order.guestPhone ||
        order.customer?.phone ||
        '';
    const deliveryAddress = [
        addr.addressLine1 || addr.address,
        addr.addressLine2,
        addr.city,
        addr.division,
        addr.postalCode,
    ]
        .filter(Boolean)
        .join(', ') || 'Doorstep Delivery Location';
    const rawMethod = (order.paymentMethod || '').toString().toUpperCase();
    let paymentMethod = 'Cash on Delivery (COD)';
    if (rawMethod.includes('UDDOKTA') ||
        rawMethod.includes('GATEWAY') ||
        rawMethod.includes('DIGITAL')) {
        paymentMethod = 'UDDOKTAPAY (Digital Gateway)';
    }
    else if (rawMethod.includes('BKASH')) {
        paymentMethod = 'bKash (Mobile Banking)';
    }
    else if (rawMethod.includes('NAGAD')) {
        paymentMethod = 'Nagad (Mobile Banking)';
    }
    else if (rawMethod.includes('COD') || rawMethod.includes('CASH')) {
        paymentMethod = 'Cash on Delivery (COD)';
    }
    else if (order.paymentMethod) {
        paymentMethod = order.paymentMethod;
    }
    const rawPaymentStatus = (order.paymentStatus || '').toString().toUpperCase();
    let paymentStatus = 'Pending';
    if (rawPaymentStatus === 'PAID' ||
        rawPaymentStatus === 'COMPLETED' ||
        rawPaymentStatus === 'FULL') {
        paymentStatus = 'Paid in Full';
    }
    else if (rawPaymentStatus === 'PARTIAL' || rawPaymentStatus === 'PARTIALLY_PAID') {
        paymentStatus = 'Partially Paid';
    }
    else if (rawPaymentStatus === 'FAILED') {
        paymentStatus = 'Failed';
    }
    else if (rawPaymentStatus === 'REFUNDED') {
        paymentStatus = 'Refunded';
    }
    else if (order.paymentStatus) {
        paymentStatus =
            order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1).toLowerCase();
    }
    const transactionId = invoiceRecord?.payments?.[0]?.providerTransactionId ||
        invoiceRecord?.payments?.[0]?.providerOrderId ||
        (order.payments && order.payments[0]?.providerTransactionId) ||
        (order.payments && order.payments[0]?.providerOrderId) ||
        order.paymentDetails?.transactionId ||
        order.paymentDetails?.trx_id ||
        order.paymentDetails?.transaction_id ||
        '';
    const deliveryMethod = order.deliveryMethod ||
        order.shippingMethod?.name ||
        'Express (24-48 Hours)';
    let deliveryStatus = '';
    if (order.deliveryStatus) {
        deliveryStatus = order.deliveryStatus;
    }
    else if (order.trackingStatus) {
        deliveryStatus = order.trackingStatus;
    }
    else if (rawStatus === 'SHIPPED' || rawStatus === 'OUT_FOR_DELIVERY') {
        deliveryStatus = 'On the Way';
    }
    else if (rawStatus === 'DELIVERED') {
        deliveryStatus = 'Delivered';
    }
    else if (rawStatus === 'CONFIRMED' || rawStatus === 'PROCESSING') {
        deliveryStatus = 'Processing';
    }
    const invoiceItems = invoiceRecord?.items && invoiceRecord.items.length > 0
        ? invoiceRecord.items
        : order.items || [];
    const items = await Promise.all(invoiceItems.map(async (item, idx) => {
        const orderItem = (order.items || []).find((oi) => (oi.sku && item.sku && oi.sku === item.sku) ||
            (oi.variantId && item.productVariantId && oi.variantId === item.productVariantId) ||
            (oi.productId && item.productId && oi.productId === item.productId && oi.size === item.size) ||
            (oi.productName && item.productName && oi.productName === item.productName)) || order.items?.[idx];
        const imgUrl = item.productImage ||
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
    }));
    const itemsSubtotal = Number(order.subtotal ?? items.reduce((acc, it) => acc + it.lineTotal, 0));
    const discountAmount = Number(order.discountAmount || 0);
    const deliveryCharge = Number(order.deliveryCharge || 0);
    const grandTotal = Number(order.totalAmount);
    const logoBase64 = getLogoBase64();
    const templateData = {
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
    try {
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
        }
        finally {
            await browser.close();
        }
    }
    catch (puppeteerErr) {
        console.warn(`[InvoiceGenerator] Puppeteer headless Chrome launch failed (${puppeteerErr?.message}). Generating fallback PDF invoice via PDFKit to guarantee invoice attachment delivery on this host...`);
        return generateInvoicePdfKitFallback(templateData);
    }
}
export function generateInvoicePdfKitFallback(data) {
    const logoBuffer = getLogoBuffer();
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 36,
                autoFirstPage: true,
                info: {
                    Title: `Invoice ${data.invoiceNumber} - Rongin Libas`,
                    Author: 'Rongin Libas Bengal Atelier',
                    Subject: `Official Tax Invoice for ${data.invoiceNumber} (Order: ${data.orderNumber})`,
                },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const margin = 36;
            const pageWidth = 595.28;
            const contentWidth = pageWidth - margin * 2;
            const headerHeight = 78;
            doc.roundedRect(margin, margin, contentWidth, headerHeight, 4).fill('#073A2D');
            doc.roundedRect(margin + 12, margin + 11, 62, 56, 3).fill('#FBF9F2');
            doc.lineWidth(1).strokeColor('#C79A45').roundedRect(margin + 12, margin + 11, 62, 56, 3).stroke();
            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, margin + 16, margin + 14, {
                        width: 54,
                        height: 50,
                        fit: [54, 50],
                        align: 'center',
                        valign: 'center',
                    });
                }
                catch {
                }
            }
            const brandTextX = margin + 82;
            doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text('RONGIN LIBAS', brandTextX, margin + 12);
            doc
                .fillColor('#D4AF37')
                .fontSize(7)
                .font('Helvetica-Bold')
                .text('CLOTH YOUR IDENTITY  •  BENGAL ATELIER', brandTextX, margin + 30);
            doc
                .fillColor('#D1D5DB')
                .fontSize(6.8)
                .font('Helvetica')
                .text('Dhaka, Bangladesh  •  orders@ronginlibas.com  •  BIN: RL-VAT-7829104', brandTextX, margin + 43);
            doc
                .fillColor('#9CA3AF')
                .fontSize(6.8)
                .font('Helvetica')
                .text('Concierge WhatsApp: +8801352926067  •  www.ronginlibas.com', brandTextX, margin + 55);
            const badgeW = 156;
            const badgeH = 58;
            const badgeX = margin + contentWidth - badgeW - 10;
            const badgeY = margin + 10;
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3).fill('#0A4D3C');
            doc.lineWidth(0.5).strokeColor('#B88E3F').roundedRect(badgeX, badgeY, badgeW, badgeH, 3).stroke();
            doc
                .fillColor('#FFFFFF')
                .fontSize(7.5)
                .font('Helvetica-Bold')
                .text('OFFICIAL TAX INVOICE', badgeX, badgeY + 6, { width: badgeW, align: 'center' });
            doc
                .fillColor('#D4AF37')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(data.invoiceNumber, badgeX, badgeY + 18, { width: badgeW, align: 'center' });
            doc
                .fillColor('#E5E7EB')
                .fontSize(6.5)
                .font('Helvetica')
                .text(`Order Ref: ${data.orderNumber}`, badgeX, badgeY + 33, { width: badgeW, align: 'center' });
            doc
                .fillColor('#D1D5DB')
                .fontSize(6.5)
                .font('Helvetica')
                .text(`Issued: ${data.issueDate}`, badgeX, badgeY + 44, { width: badgeW, align: 'center' });
            const cardsY = margin + headerHeight + 10;
            const cardH = 76;
            const cardW = (contentWidth - 10) / 2;
            doc.roundedRect(margin, cardsY, cardW, cardH, 4).fill('#F8FAFC');
            doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(margin, cardsY, cardW, cardH, 4).stroke();
            doc.roundedRect(margin, cardsY, cardW, 17, 3).fill('#EEF2F6');
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('CONSIGNEE / BILLED TO', margin + 8, cardsY + 5);
            doc.fillColor('#111827').fontSize(8.5).font('Helvetica-Bold').text(data.customerName || 'Valued Patron', margin + 8, cardsY + 22, {
                width: cardW - 16,
                ellipsis: true,
            });
            doc.fillColor('#4B5563').fontSize(7).font('Helvetica').text(`Phone: ${data.customerPhone || 'N/A'}`, margin + 8, cardsY + 35, {
                width: cardW - 16,
                ellipsis: true,
            });
            doc.fillColor('#4B5563').fontSize(6.8).font('Helvetica').text(`Destination: ${data.deliveryAddress || 'Doorstep Delivery Location'}`, margin + 8, cardsY + 47, {
                width: cardW - 16,
                height: 24,
                ellipsis: true,
            });
            const rightCardX = margin + cardW + 10;
            doc.roundedRect(rightCardX, cardsY, cardW, cardH, 4).fill('#F8FAFC');
            doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(rightCardX, cardsY, cardW, cardH, 4).stroke();
            doc.roundedRect(rightCardX, cardsY, cardW, 17, 3).fill('#EEF2F6');
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('PAYMENT & DELIVERY SPEC', rightCardX + 8, cardsY + 5);
            const pillW = 60;
            const pillH = 13;
            const pillX = rightCardX + cardW - pillW - 6;
            const pillY = cardsY + 2;
            doc.roundedRect(pillX, pillY, pillW, pillH, 2).fill('#DCFCE7');
            doc.fillColor('#15803D').fontSize(6).font('Helvetica-Bold').text(data.orderStatus, pillX, pillY + 3, { width: pillW, align: 'center' });
            doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(`Payment Method: ${data.paymentMethod}`, rightCardX + 8, cardsY + 22, { width: cardW - 16, ellipsis: true });
            doc.fillColor('#4B5563').fontSize(7).font('Helvetica').text(`Payment Status: ${data.paymentStatus}`, rightCardX + 8, cardsY + 35, { width: cardW - 16, ellipsis: true });
            doc.fillColor('#4B5563').fontSize(7).font('Helvetica').text(`Delivery: ${data.deliveryMethod}${data.deliveryStatus ? ` [${data.deliveryStatus}]` : ''}`, rightCardX + 8, cardsY + 47, { width: cardW - 16, ellipsis: true });
            if (data.transactionId) {
                doc.fillColor('#059669').fontSize(6.5).font('Helvetica-Bold').text(`Transaction ID: ${data.transactionId}`, rightCardX + 8, cardsY + 59, { width: cardW - 16, ellipsis: true });
            }
            const tableY = cardsY + cardH + 10;
            const tableHdrHeight = 22;
            doc.roundedRect(margin, tableY, contentWidth, tableHdrHeight, 3).fill('#073A2D');
            doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold');
            doc.text('#', margin + 6, tableY + 7, { width: 38, align: 'center' });
            doc.text('ITEM & SARTORIAL SPECIFICATION', margin + 48, tableY + 7, { width: 236 });
            doc.text('UNIT PRICE', margin + 288, tableY + 7, { width: 70, align: 'right' });
            doc.text('QTY / ITEMS', margin + 364, tableY + 7, { width: 56, align: 'center' });
            doc.text('TOTAL AMOUNT', margin + 424, tableY + 7, { width: 90, align: 'right' });
            const rowHeight = 48;
            let currentY = tableY + tableHdrHeight;
            data.items.forEach((item, index) => {
                const isAlt = index % 2 === 1;
                if (isAlt) {
                    doc.rect(margin, currentY, contentWidth, rowHeight).fill('#FBFBFA');
                }
                doc.lineWidth(0.5).strokeColor('#E5E7EB').moveTo(margin, currentY + rowHeight).lineTo(margin + contentWidth, currentY + rowHeight).stroke();
                const imgW = 28;
                const imgH = 36;
                const imgX = margin + 12;
                const imgY = currentY + 6;
                doc.roundedRect(imgX, imgY, imgW, imgH, 2).fill('#F3F4F6');
                doc.lineWidth(0.5).strokeColor('#D1D5DB').roundedRect(imgX, imgY, imgW, imgH, 2).stroke();
                let drewImg = false;
                if (item.thumbnailBase64 && item.thumbnailBase64.startsWith('data:image/')) {
                    try {
                        const rawBase64 = item.thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
                        const itemImgBuf = Buffer.from(rawBase64, 'base64');
                        doc.image(itemImgBuf, imgX, imgY, { width: imgW, height: imgH, fit: [imgW, imgH], align: 'center', valign: 'center' });
                        drewImg = true;
                    }
                    catch {
                        drewImg = false;
                    }
                }
                if (!drewImg) {
                    doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica-Bold').text('RL', imgX, imgY + 12, { width: imgW, align: 'center' });
                }
                doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text(item.productName, margin + 48, currentY + 9, { width: 236, ellipsis: true });
                const specs = [
                    item.size ? `Size: ${item.size}` : null,
                    item.color ? `Color: ${item.color}` : null,
                    item.sku ? `SKU: ${item.sku}` : null,
                ].filter(Boolean).join('  |  ') || 'Atelier Standard';
                doc.fillColor('#6B7280').fontSize(6.8).font('Helvetica').text(specs, margin + 48, currentY + 24, { width: 236, ellipsis: true });
                doc.fillColor('#374151').fontSize(8).font('Helvetica').text(`BDT ${item.unitPrice.toLocaleString()}`, margin + 288, currentY + 18, { width: 70, align: 'right' });
                doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text(`${item.quantity} pc${item.quantity > 1 ? 's' : ''}`, margin + 364, currentY + 18, { width: 56, align: 'center' });
                doc.fillColor('#073A2D').fontSize(8.5).font('Helvetica-Bold').text(`BDT ${item.lineTotal.toLocaleString()}`, margin + 424, currentY + 18, { width: 90, align: 'right' });
                currentY += rowHeight;
            });
            doc.lineWidth(0.5).strokeColor('#E5E7EB').roundedRect(margin, tableY, contentWidth, currentY - tableY, 3).stroke();
            const summarySecY = currentY + 12;
            drawBarcode(doc, data.invoiceNumber, margin + 8, summarySecY + 4, 180, 22);
            doc.fillColor('#374151').fontSize(7).font('Helvetica-Bold').text(`* ${data.invoiceNumber} *`, margin + 8, summarySecY + 28, { width: 180, align: 'center' });
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('OFFICIAL TAX INVOICE & CONSIGNMENT BILL', margin + 8, summarySecY + 42);
            doc.fillColor('#6B7280').fontSize(6.5).font('Helvetica').text('Computer-generated tax invoice officially valid without physical signature.', margin + 8, summarySecY + 53);
            doc.fillColor('#6B7280').fontSize(6.5).font('Helvetica').text('For concierge helpline, WhatsApp +8801352926067.', margin + 8, summarySecY + 63);
            const summaryBoxW = 236;
            const summaryBoxX = margin + contentWidth - summaryBoxW;
            const discountVal = Number(data.discountAmount || 0);
            const deliveryVal = Number(data.deliveryCharge || 0);
            const subtotalVal = Number(data.itemsSubtotal || 0);
            const grandTotalVal = Number(data.grandTotal || 0);
            const summaryBoxH = discountVal > 0 ? 94 : 80;
            doc.roundedRect(summaryBoxX, summarySecY, summaryBoxW, summaryBoxH, 4).fill('#F8FAFC');
            doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(summaryBoxX, summarySecY, summaryBoxW, summaryBoxH, 4).stroke();
            let sY = summarySecY + 8;
            doc.fillColor('#4B5563').fontSize(7.5).font('Helvetica').text('Items Subtotal:', summaryBoxX + 12, sY);
            doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(`BDT ${subtotalVal.toLocaleString()}`, summaryBoxX + 100, sY, { width: summaryBoxW - 112, align: 'right' });
            sY += 15;
            const deliveryStr = deliveryVal === 0 ? 'FREE' : `BDT ${deliveryVal.toLocaleString()}`;
            doc.fillColor('#4B5563').fontSize(7.5).font('Helvetica').text('Packaging & Delivery:', summaryBoxX + 12, sY);
            doc.fillColor(deliveryVal === 0 ? '#059669' : '#111827').fontSize(7.5).font('Helvetica-Bold').text(deliveryStr, summaryBoxX + 100, sY, { width: summaryBoxW - 112, align: 'right' });
            if (discountVal > 0) {
                sY += 15;
                doc.fillColor('#059669').fontSize(7.5).font('Helvetica').text('Promotional Voucher:', summaryBoxX + 12, sY);
                doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text(`- BDT ${discountVal.toLocaleString()}`, summaryBoxX + 100, sY, { width: summaryBoxW - 112, align: 'right' });
            }
            sY += 16;
            const totalBannerH = 24;
            doc.roundedRect(summaryBoxX + 6, sY, summaryBoxW - 12, totalBannerH, 3).fill('#073A2D');
            doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('TOTAL AMOUNT:', summaryBoxX + 14, sY + 7);
            doc.fillColor('#D4AF37').fontSize(9.5).font('Helvetica-Bold').text(`BDT ${grandTotalVal.toLocaleString()}`, summaryBoxX + 100, sY + 6, { width: summaryBoxW - 122, align: 'right' });
            const footerY = 746;
            doc.lineWidth(0.5).strokeColor('#E2E8F0').moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).stroke();
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('AUTHENTIC PRODUCTS', margin, footerY + 8);
            doc.fillColor('#6B7280').fontSize(6).font('Helvetica').text('100% Genuine Bengal Craftsmanship', margin, footerY + 17);
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('EASY EXCHANGE', margin + 174, footerY + 8);
            doc.fillColor('#6B7280').fontSize(6).font('Helvetica').text('2-Day Doorstep Exchange Policy', margin + 174, footerY + 17);
            doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text('CUSTOMER SUPPORT', margin + 348, footerY + 8);
            doc.fillColor('#6B7280').fontSize(6).font('Helvetica').text('WhatsApp: +8801352926067', margin + 348, footerY + 17);
            const bottomWaveY = 776;
            doc.rect(margin, bottomWaveY, contentWidth, 24).fill('#073A2D');
            doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold').text('RONGIN LIBAS  •  CLOTH YOUR IDENTITY', margin + 12, bottomWaveY + 8);
            doc.fillColor('#D4AF37').fontSize(7).font('Helvetica').text('facebook.com/ronginlibas  •  www.ronginlibas.com', margin + 280, bottomWaveY + 8, { width: contentWidth - 290, align: 'right' });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
function drawBarcode(doc, value, x, y, width, height) {
    const clean = (value || 'RL001').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pattern = [2, 1, 3, 1, 1, 2, 3, 2];
    for (let i = 0; i < clean.length; i++) {
        const code = clean.charCodeAt(i);
        pattern.push((code % 3) + 1.2);
        pattern.push(((code * 3) % 2) + 1);
        pattern.push(((code * 7) % 3) + 1.2);
        pattern.push(1);
    }
    pattern.push(3, 1, 2, 1, 3);
    const totalUnits = pattern.reduce((acc, val) => acc + val, 0);
    const scale = width / totalUnits;
    let currX = x;
    doc.save();
    pattern.forEach((w, idx) => {
        const barW = w * scale;
        if (idx % 2 === 0) {
            doc.rect(currX, y, barW, height).fill('#111827');
        }
        currX += barW;
    });
    doc.restore();
}
//# sourceMappingURL=invoice-generator.js.map