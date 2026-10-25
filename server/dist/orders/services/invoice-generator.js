import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import PDFDocument from 'pdfkit';
import chromium from '@sparticuz/chromium';
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
export async function resolveBrowserLaunchConfig() {
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (envPath && fs.existsSync(envPath)) {
        return {
            executablePath: envPath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=medium',
            ],
            headless: true,
        };
    }
    const localCandidates = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ];
    for (const c of localCandidates) {
        if (fs.existsSync(c)) {
            return {
                executablePath: c,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--font-render-hinting=medium',
                ],
                headless: true,
            };
        }
    }
    try {
        const sparticuzPath = await chromium.executablePath();
        if (sparticuzPath) {
            return {
                executablePath: sparticuzPath,
                args: chromium.args,
                headless: true,
            };
        }
    }
    catch (err) {
        console.warn(`[InvoiceGenerator] Failed extracting @sparticuz/chromium binary: ${err?.message}`);
    }
    return {
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=medium',
        ],
        headless: true,
    };
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
        const launchConfig = await resolveBrowserLaunchConfig();
        const browser = await puppeteer.launch({
            executablePath: launchConfig.executablePath,
            args: launchConfig.args,
            headless: launchConfig.headless,
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load', timeout: 15000 });
            await page.evaluateHandle('document.fonts.ready').catch(() => { });
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
        console.error(`[InvoiceGenerator] Puppeteer headless Chrome launch failed on runtime (platform: ${process.platform}, arch: ${process.arch}, VERCEL: ${Boolean(process.env.VERCEL)}): ${puppeteerErr?.message}. Generating fallback PDF invoice via PDFKit to guarantee invoice attachment delivery on this host...`, puppeteerErr?.stack ? `\nStack: ${puppeteerErr.stack}` : '');
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
            const headerTopY = margin;
            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, margin, headerTopY, {
                        width: 48,
                        height: 44,
                        fit: [48, 44],
                        valign: 'center',
                    });
                }
                catch {
                }
            }
            const brandTextX = logoBuffer ? margin + 54 : margin;
            doc
                .fillColor('#073A2D')
                .fontSize(19)
                .font('Helvetica-Bold')
                .text('RONGIN LIBAS', brandTextX, headerTopY + 3);
            doc
                .fillColor('#6B7280')
                .fontSize(6.5)
                .font('Helvetica-Bold')
                .text('C L O T H   Y O U R   I D E N T I T Y', brandTextX, headerTopY + 26);
            const rightMetaW = 220;
            const rightMetaX = margin + contentWidth - rightMetaW;
            doc
                .fillColor('#073A2D')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('INVOICE', rightMetaX, headerTopY, { width: rightMetaW, align: 'right' });
            let metaY = headerTopY + 24;
            const metaRow = (label, val, isStatus = false) => {
                doc.fillColor('#6B7280').fontSize(7).font('Helvetica').text(label, rightMetaX, metaY, { width: 90, align: 'right' });
                doc.fillColor('#9CA3AF').fontSize(7).font('Helvetica').text(':', rightMetaX + 94, metaY, { width: 8, align: 'center' });
                if (isStatus) {
                    const isConfirmed = ['confirmed', 'delivered', 'completed', 'shipped'].includes(val.toLowerCase());
                    const pillBg = isConfirmed ? '#DCFCE7' : '#DBEAFE';
                    const pillText = isConfirmed ? '#166534' : '#1E40AF';
                    const pillW = 54;
                    const pillH = 11;
                    const pillX = margin + contentWidth - pillW;
                    doc.roundedRect(pillX, metaY - 1, pillW, pillH, 2).fill(pillBg);
                    doc.fillColor(pillText).fontSize(6.5).font('Helvetica-Bold').text(val, pillX, metaY + 1, { width: pillW, align: 'center' });
                }
                else {
                    doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(val, rightMetaX + 104, metaY, { width: rightMetaW - 104, align: 'right' });
                }
                metaY += 12;
            };
            metaRow('Invoice No', data.invoiceNumber);
            metaRow('Order No', data.orderNumber);
            metaRow('Issue Date', data.issueDate);
            metaRow('Order Status', data.orderStatus, true);
            const dividerY = Math.max(metaY + 6, headerTopY + 74);
            doc
                .lineWidth(0.5)
                .strokeColor('#E5E7EB')
                .moveTo(margin, dividerY)
                .lineTo(margin + contentWidth, dividerY)
                .stroke();
            const cardsY = dividerY + 10;
            const cardH = 76;
            const cardW = (contentWidth - 12) / 2;
            doc.roundedRect(margin, cardsY, cardW, cardH, 4).fill('#FBFBFA');
            doc.lineWidth(0.5).strokeColor('#E5E7EB').roundedRect(margin, cardsY, cardW, cardH, 4).stroke();
            doc.fillColor('#073A2D').fontSize(7.5).font('Helvetica-Bold').text('SOLD TO', margin + 12, cardsY + 8);
            doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text(data.customerName || 'Valued Patron', margin + 12, cardsY + 22, {
                width: cardW - 24,
                ellipsis: true,
            });
            doc.fillColor('#4B5563').fontSize(7.5).font('Helvetica').text(`Phone: ${data.customerPhone || 'N/A'}`, margin + 12, cardsY + 34);
            doc.fillColor('#6B7280').fontSize(6.8).font('Helvetica').text('Delivery Address:', margin + 12, cardsY + 46);
            doc.fillColor('#374151').fontSize(7.2).font('Helvetica').text(data.deliveryAddress || 'Doorstep Delivery Location', margin + 12, cardsY + 56, {
                width: cardW - 24,
                height: 18,
                ellipsis: true,
            });
            const rightCardX = margin + cardW + 12;
            doc.roundedRect(rightCardX, cardsY, cardW, cardH, 4).fill('#FBFBFA');
            doc.lineWidth(0.5).strokeColor('#E5E7EB').roundedRect(rightCardX, cardsY, cardW, cardH, 4).stroke();
            doc.fillColor('#073A2D').fontSize(7.5).font('Helvetica-Bold').text('PAYMENT & DELIVERY', rightCardX + 12, cardsY + 8);
            let pY = cardsY + 22;
            const payRow = (label, val, isPaymentStatus = false) => {
                doc.fillColor('#6B7280').fontSize(7).font('Helvetica').text(label, rightCardX + 12, pY);
                doc.fillColor('#9CA3AF').fontSize(7).font('Helvetica').text(':', rightCardX + 80, pY);
                if (isPaymentStatus) {
                    const isPaid = val.toLowerCase().includes('paid');
                    const pillBg = isPaid ? '#DCFCE7' : '#FEF3C7';
                    const pillText = isPaid ? '#15803D' : '#B45309';
                    const pillW = 48;
                    const pillH = 11;
                    doc.roundedRect(rightCardX + 88, pY - 1, pillW, pillH, 2).fill(pillBg);
                    doc.fillColor(pillText).fontSize(6.5).font('Helvetica-Bold').text(val, rightCardX + 88, pY + 1, { width: pillW, align: 'center' });
                }
                else {
                    doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(val, rightCardX + 88, pY, { width: cardW - 96, ellipsis: true });
                }
                pY += 12;
            };
            payRow('Payment Method', data.paymentMethod);
            payRow('Payment Status', data.paymentStatus, true);
            payRow('Delivery Method', data.deliveryMethod);
            if (data.deliveryStatus && data.deliveryStatus.trim().length > 0) {
                payRow('Delivery Status', data.deliveryStatus, true);
            }
            if (data.transactionId) {
                payRow('Transaction ID', data.transactionId);
            }
            const actualCardH = Math.max(cardH, pY - cardsY + 6);
            const tableY = cardsY + actualCardH + 10;
            const tableHdrHeight = 22;
            doc.roundedRect(margin, tableY, contentWidth, tableHdrHeight, 2).fill('#073A2D');
            doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold');
            doc.text('#', margin + 6, tableY + 7, { width: 28, align: 'center' });
            doc.text('PRODUCT DETAILS', margin + 40, tableY + 7, { width: 240 });
            doc.text('UNIT PRICE', margin + 288, tableY + 7, { width: 70, align: 'right' });
            doc.text('QTY', margin + 364, tableY + 7, { width: 56, align: 'center' });
            doc.text('TOTAL', margin + 424, tableY + 7, { width: 90, align: 'right' });
            const rowHeight = 46;
            let currentY = tableY + tableHdrHeight;
            data.items.forEach((item, index) => {
                const isAlt = index % 2 === 1;
                if (isAlt) {
                    doc.rect(margin, currentY, contentWidth, rowHeight).fill('#FBFBFA');
                }
                doc
                    .lineWidth(0.5)
                    .strokeColor('#E5E7EB')
                    .moveTo(margin, currentY + rowHeight)
                    .lineTo(margin + contentWidth, currentY + rowHeight)
                    .stroke();
                doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica').text(`${index + 1}`, margin + 6, currentY + 17, { width: 28, align: 'center' });
                const imgW = 28;
                const imgH = 34;
                const imgX = margin + 38;
                const imgY = currentY + 6;
                doc.roundedRect(imgX, imgY, imgW, imgH, 2).fill('#F3F4F6');
                doc.lineWidth(0.5).strokeColor('#E5E7EB').roundedRect(imgX, imgY, imgW, imgH, 2).stroke();
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
                    doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica-Bold').text('RL', imgX, imgY + 11, { width: imgW, align: 'center' });
                }
                doc.fillColor('#111827').fontSize(8.5).font('Helvetica-Bold').text(item.productName, margin + 74, currentY + 8, { width: 206, ellipsis: true });
                const specs = [
                    item.size ? `Size: ${item.size}` : null,
                    item.color ? `Color: ${item.color}` : null,
                ].filter(Boolean).join('   ');
                if (specs) {
                    doc.fillColor('#4B5563').fontSize(6.8).font('Helvetica').text(specs, margin + 74, currentY + 21, { width: 206, ellipsis: true });
                }
                if (item.sku) {
                    doc.fillColor('#9CA3AF').fontSize(6.5).font('Helvetica').text(`SKU: ${item.sku}`, margin + 74, currentY + 31, { width: 206, ellipsis: true });
                }
                doc.fillColor('#374151').fontSize(8).font('Helvetica').text(`BDT ${item.unitPrice.toLocaleString('en-US')}`, margin + 288, currentY + 16, { width: 70, align: 'right' });
                doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text(`${item.quantity} pc${item.quantity > 1 ? 's' : ''}`, margin + 364, currentY + 16, { width: 56, align: 'center' });
                doc.fillColor('#073A2D').fontSize(8.5).font('Helvetica-Bold').text(`BDT ${item.lineTotal.toLocaleString('en-US')}`, margin + 424, currentY + 16, { width: 90, align: 'right' });
                currentY += rowHeight;
            });
            doc.lineWidth(0.5).strokeColor('#E5E7EB').roundedRect(margin, tableY, contentWidth, currentY - tableY, 2).stroke();
            const summarySecY = currentY + 14;
            doc
                .fillColor('#073A2D')
                .fontSize(16)
                .font('Helvetica-Bold')
                .text('Thank You', margin + 8, summarySecY + 2);
            doc
                .fillColor('#6B7280')
                .fontSize(6.5)
                .font('Helvetica-Bold')
                .text('F O R   S H O P P I N G   W I T H', margin + 8, summarySecY + 22);
            doc
                .fillColor('#073A2D')
                .fontSize(7.5)
                .font('Helvetica-Bold')
                .text('R O N G I N   L I B A S', margin + 8, summarySecY + 31);
            doc
                .fillColor('#059669')
                .fontSize(7)
                .font('Helvetica')
                .text('We appreciate your trust and support. Your style inspires us!', margin + 8, summarySecY + 44, { width: 240 });
            const summaryBoxW = 236;
            const summaryBoxX = margin + contentWidth - summaryBoxW;
            const discountVal = Number(data.discountAmount || 0);
            const deliveryVal = Number(data.deliveryCharge || 0);
            const subtotalVal = Number(data.itemsSubtotal || 0);
            const grandTotalVal = Number(data.grandTotal || 0);
            let sY = summarySecY + 4;
            doc.fillColor('#4B5563').fontSize(7.5).font('Helvetica').text('Items Subtotal', summaryBoxX + 10, sY);
            doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(`BDT ${subtotalVal.toLocaleString('en-US')}`, summaryBoxX + 90, sY, { width: summaryBoxW - 100, align: 'right' });
            sY += 15;
            const deliveryStr = deliveryVal === 0 ? 'FREE' : `BDT ${deliveryVal.toLocaleString('en-US')}`;
            doc.fillColor('#4B5563').fontSize(7.5).font('Helvetica').text('Packaging & Delivery', summaryBoxX + 10, sY);
            doc.fillColor(deliveryVal === 0 ? '#059669' : '#111827').fontSize(7.5).font('Helvetica-Bold').text(deliveryStr, summaryBoxX + 90, sY, { width: summaryBoxW - 100, align: 'right' });
            if (discountVal > 0) {
                sY += 15;
                doc.fillColor('#059669').fontSize(7.5).font('Helvetica').text('Promotional Discount', summaryBoxX + 10, sY);
                doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text(`- BDT ${discountVal.toLocaleString('en-US')}`, summaryBoxX + 90, sY, { width: summaryBoxW - 100, align: 'right' });
            }
            sY += 16;
            const totalBannerH = 24;
            doc.roundedRect(summaryBoxX, sY, summaryBoxW, totalBannerH, 3).fill('#F0FDF4');
            doc.lineWidth(1).strokeColor('#86EFAC').roundedRect(summaryBoxX, sY, summaryBoxW, totalBannerH, 3).stroke();
            doc.fillColor('#073A2D').fontSize(8.5).font('Helvetica-Bold').text('Total Amount', summaryBoxX + 12, sY + 7);
            doc.fillColor('#073A2D').fontSize(10).font('Helvetica-Bold').text(`BDT ${grandTotalVal.toLocaleString('en-US')}`, summaryBoxX + 90, sY + 6, { width: summaryBoxW - 102, align: 'right' });
            const badgesY = 732;
            doc.lineWidth(0.5).strokeColor('#E5E7EB').moveTo(margin, badgesY).lineTo(margin + contentWidth, badgesY).stroke();
            const colW = contentWidth / 4;
            const badgeCol = (title, sub, colIdx) => {
                const cX = margin + colIdx * colW;
                doc.fillColor('#073A2D').fontSize(7).font('Helvetica-Bold').text(title, cX + 4, badgesY + 8, { width: colW - 8 });
                doc.fillColor('#6B7280').fontSize(6).font('Helvetica').text(sub, cX + 4, badgesY + 18, { width: colW - 8 });
            };
            badgeCol('AUTHENTIC PRODUCTS', 'Premium quality garments', 0);
            badgeCol('FAST & RELIABLE DELIVERY', '24-48 hours doorstep', 1);
            badgeCol('EASY EXCHANGE', '2-day hassle-free', 2);
            badgeCol('CUSTOMER SUPPORT', 'WhatsApp: 01352926067', 3);
            const bottomBarY = 768;
            const bottomBarH = 26;
            doc.rect(margin, bottomBarY, contentWidth, bottomBarH).fill('#073A2D');
            doc
                .fillColor('#FFFFFF')
                .fontSize(7.5)
                .font('Helvetica-Bold')
                .text('facebook.com/ronginlibas', margin + 120, bottomBarY + 9, {
                link: 'https://facebook.com/ronginlibas',
                underline: false,
            });
            doc
                .fillColor('#FFFFFF')
                .fontSize(7.5)
                .font('Helvetica-Bold')
                .text('www.ronginlibas.com', margin + contentWidth - 210, bottomBarY + 9, {
                link: 'https://www.ronginlibas.com',
                underline: false,
            });
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