var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { renderPasswordResetEmail, renderPasswordResetSuccessEmail, renderWelcomeEmail, renderAccountBannedEmail, renderStaffWelcomeEmail, renderOrderConfirmationEmail, renderOrderStatusUpdateEmail, renderOrderEditEmail, renderAbandonedCartReminderEmail, renderBackInStockEmail, renderAdminOrderCancellationAlertEmail, } from './templates/index.js';
let MailService = MailService_1 = class MailService {
    configService;
    logger = new Logger(MailService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    getTransporter() {
        const host = this.configService.get('SMTP_HOST');
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        const port = Number(this.configService.get('SMTP_PORT') || 587);
        const secure = this.configService.get('SMTP_SECURE') === 'true';
        if (!host || !user || !pass) {
            this.logger.warn('SMTP service is not configured. Email dispatch skipped.');
            return null;
        }
        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });
    }
    getFromAddress(type = 'auth') {
        if (type === 'orders') {
            const ordersFrom = this.configService.get('SMTP_FROM_ORDERS');
            if (ordersFrom) {
                return ordersFrom.includes('<') ? ordersFrom : `Rongin Libas Orders <${ordersFrom}>`;
            }
            return 'Rongin Libas Orders <orders@ronginlibas.com>';
        }
        const authFrom = this.configService.get('SMTP_FROM') ||
            'Rongin Libas <noreply@ronginlibas.com>';
        return authFrom.includes('<') ? authFrom : `Rongin Libas <${authFrom}>`;
    }
    getWebUrl() {
        const isProduction = this.configService.get('app.nodeEnv') === 'production' ||
            process.env.NODE_ENV === 'production';
        const configured = this.configService.get('app.webFrontendUrl') ||
            this.configService.get('WEB_FRONTEND_URL') ||
            this.configService.get('FRONTEND_URL') ||
            this.configService.get('APP_URL') ||
            this.configService.get('NEXT_PUBLIC_APP_URL') ||
            process.env.WEB_FRONTEND_URL ||
            process.env.FRONTEND_URL ||
            process.env.APP_URL;
        if (configured && configured.trim()) {
            const cleanUrl = configured.trim().replace(/\/$/, '');
            if (isProduction && (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1'))) {
                return 'https://ronginlibas.com';
            }
            return cleanUrl;
        }
        return isProduction ? 'https://ronginlibas.com' : 'http://localhost:3000';
    }
    getAdminUrl() {
        const isProduction = this.configService.get('app.nodeEnv') === 'production' ||
            process.env.NODE_ENV === 'production';
        const configured = this.configService.get('app.adminFrontendUrl') ||
            this.configService.get('ADMIN_FRONTEND_URL') ||
            this.configService.get('ADMIN_URL') ||
            process.env.ADMIN_FRONTEND_URL ||
            process.env.ADMIN_URL;
        if (configured && configured.trim()) {
            const cleanUrl = configured.trim().replace(/\/$/, '');
            if (isProduction && (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1'))) {
                return 'https://admin.ronginlibas.com';
            }
            return cleanUrl;
        }
        return isProduction ? 'https://admin.ronginlibas.com' : 'http://localhost:3001';
    }
    async sendPasswordResetEmail(email, resetToken, name) {
        const transporter = this.getTransporter();
        if (!transporter) {
            throw new Error('Password reset email service is not configured');
        }
        const webUrl = this.getWebUrl();
        const resetUrl = `${webUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        const from = this.getFromAddress('auth');
        const { subject, html, text } = renderPasswordResetEmail({
            name,
            resetUrl,
            expiresInMinutes: 30,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: email,
                subject,
                html,
                text,
            });
            this.logger.log(`Password reset email dispatched to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            transporter.close();
        }
    }
    async sendPasswordResetSuccessEmail(email, name) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const loginUrl = `${webUrl}/login`;
        const from = this.getFromAddress('auth');
        const { subject, html, text } = renderPasswordResetSuccessEmail({
            name,
            loginUrl,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: email,
                subject,
                html,
                text,
            });
            this.logger.log(`Password reset success email dispatched to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch password reset success notification to ${email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendWelcomeEmail(email, name) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const shopUrl = `${webUrl}/shop`;
        const profileUrl = `${webUrl}/profile`;
        const from = this.getFromAddress('auth');
        const { subject, html, text } = renderWelcomeEmail({
            name,
            shopUrl,
            profileUrl,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: email,
                subject,
                html,
                text,
            });
            this.logger.log(`Welcome email dispatched to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch welcome email to ${email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendAccountBannedEmail(email, reason, name) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const from = this.getFromAddress('auth');
        const { subject, html, text } = renderAccountBannedEmail({
            name,
            reason,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: email,
                subject,
                html,
                text,
            });
            this.logger.log(`Account banned notification dispatched to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch account banned email to ${email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendStaffWelcomeEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const adminUrl = this.getAdminUrl();
        const loginUrl = `${adminUrl}/login`;
        const webUrl = this.getWebUrl();
        const from = this.getFromAddress('auth');
        const { subject, html, text } = renderStaffWelcomeEmail({
            fullName: params.fullName,
            email: params.email,
            userId: params.userId,
            role: params.role,
            password: params.password,
            loginUrl,
            mustChangePassword: params.mustChangePassword,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
            });
            this.logger.log(`Staff welcome credentials email dispatched to ${params.email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch staff welcome credentials email to ${params.email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendOrderConfirmationEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const trackQuery = new URLSearchParams();
        trackQuery.set('id', params.orderNumber);
        if (params.trackingToken) {
            trackQuery.set('trackingToken', params.trackingToken);
        }
        const trackUrl = `${webUrl}/track-order?${trackQuery.toString()}`;
        const from = this.getFromAddress('orders');
        const cleanOrderNum = params.orderNumber.replace(/[^a-zA-Z0-9-_]/g, '');
        const cleanInvoiceRef = (params.invoiceNumber || cleanOrderNum).replace(/[^a-zA-Z0-9-_]/g, '');
        const { subject, html, text } = renderOrderConfirmationEmail({
            orderNumber: params.orderNumber,
            orderStatus: params.orderStatus,
            customerName: params.customerName,
            items: params.items,
            subtotal: params.subtotal,
            deliveryCharge: params.deliveryCharge,
            discountAmount: params.discountAmount,
            totalAmount: params.totalAmount,
            paymentMethod: params.paymentMethod,
            paymentStatus: params.paymentStatus,
            shippingAddress: params.shippingAddress,
            customerNotes: params.customerNotes,
            trackUrl,
            webUrl,
            hasInvoiceAttachment: Boolean(params.invoiceBuffer),
            invoiceNumber: params.invoiceNumber,
        });
        const attachments = params.invoiceBuffer
            ? [
                {
                    filename: `Rongin-Libas-Invoice-${cleanInvoiceRef}.pdf`,
                    content: params.invoiceBuffer,
                    contentType: 'application/pdf',
                },
            ]
            : undefined;
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
                attachments,
            });
            this.logger.log(`Order confirmation email dispatched to ${params.email} for ${params.orderNumber} (Invoice attached: ${Boolean(params.invoiceBuffer)}) via ${from} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch order confirmation email to ${params.email} for ${params.orderNumber}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendOrderStatusUpdateEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const trackQuery = new URLSearchParams();
        trackQuery.set('id', params.orderNumber);
        if (params.trackingToken) {
            trackQuery.set('trackingToken', params.trackingToken);
        }
        const trackUrl = `${webUrl}/track-order?${trackQuery.toString()}`;
        const from = this.getFromAddress('orders');
        const { subject, html, text } = renderOrderStatusUpdateEmail({
            orderNumber: params.orderNumber,
            customerName: params.customerName,
            newStatus: params.newStatus,
            previousStatus: params.previousStatus,
            courierName: params.courierName,
            trackingNumber: params.trackingNumber,
            trackingUrl: params.trackingUrl,
            estimatedDelivery: params.estimatedDelivery,
            adminNotes: params.adminNotes,
            totalAmount: params.totalAmount,
            shippingAddress: params.shippingAddress,
            trackUrl,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
            });
            this.logger.log(`Order status update email (${params.newStatus}) dispatched to ${params.email} for ${params.orderNumber} via ${from} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch order status update email to ${params.email} for ${params.orderNumber}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendOrderEditEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const trackQuery = new URLSearchParams();
        trackQuery.set('id', params.orderNumber);
        if (params.trackingToken) {
            trackQuery.set('trackingToken', params.trackingToken);
        }
        const trackUrl = `${webUrl}/track-order?${trackQuery.toString()}`;
        const from = this.getFromAddress('orders');
        const { subject, html, text } = renderOrderEditEmail({
            orderNumber: params.orderNumber,
            customerName: params.customerName,
            status: params.status,
            totalAmount: params.totalAmount,
            changeSummary: params.changeSummary,
            shippingAddress: params.shippingAddress,
            courierName: params.courierName,
            trackingNumber: params.trackingNumber,
            trackingUrl: params.trackingUrl,
            adminNotes: params.adminNotes,
            trackUrl,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
            });
            this.logger.log(`Order edit email dispatched to ${params.email} for ${params.orderNumber} via ${from} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch order edit email to ${params.email} for ${params.orderNumber}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendAbandonedCartReminderEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const cartUrl = `${webUrl}/shop`;
        const checkoutUrl = `${webUrl}/checkout`;
        const from = this.getFromAddress('orders');
        const { subject, html, text } = renderAbandonedCartReminderEmail({
            customerName: params.customerName,
            items: params.items,
            subtotal: params.subtotal,
            totalAmount: params.totalAmount,
            cartUrl,
            checkoutUrl,
            customMessage: params.customMessage,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
            });
            this.logger.log(`Abandoned cart reminder email dispatched to ${params.email} via ${from} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch abandoned cart reminder email to ${params.email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    async sendBackInStockEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const webUrl = this.getWebUrl();
        const from = this.getFromAddress('orders');
        const { subject, html, text } = renderBackInStockEmail({
            customerName: params.customerName,
            productName: params.productName,
            productSlug: params.productSlug,
            price: params.price,
            imageUrl: params.imageUrl,
            size: params.size,
            color: params.color,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: params.email,
                subject,
                html,
                text,
            });
            this.logger.log(`Back-in-stock notification dispatched to ${params.email} for ${params.productName} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch back-in-stock notification to ${params.email}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
    getAdminAlertEmail() {
        return (this.configService.get('ADMIN_ALERT_EMAIL') ||
            this.configService.get('SMTP_ADMIN_EMAIL') ||
            this.configService.get('SMTP_USER') ||
            'admin@ronginlibas.com');
    }
    async sendAdminOrderCancellationAlertEmail(params) {
        const transporter = this.getTransporter();
        if (!transporter)
            return false;
        const recipient = params.adminEmail || this.getAdminAlertEmail();
        const adminUrl = this.getAdminUrl();
        const adminOrderUrl = `${adminUrl}/orders?search=${encodeURIComponent(params.orderNumber)}`;
        const webUrl = this.getWebUrl();
        const from = this.getFromAddress('orders');
        const { subject, html, text } = renderAdminOrderCancellationAlertEmail({
            orderNumber: params.orderNumber,
            customerName: params.customerName,
            customerPhone: params.customerPhone,
            customerEmail: params.customerEmail,
            createdAt: params.createdAt,
            cancelledAt: params.cancelledAt,
            orderAgeText: params.orderAgeText,
            paymentMethod: params.paymentMethod,
            paymentStatus: params.paymentStatus,
            totalAmount: params.totalAmount,
            items: params.items,
            adminNotes: params.adminNotes,
            adminOrderUrl,
            webUrl,
        });
        try {
            const info = await transporter.sendMail({
                from,
                to: recipient,
                subject,
                html,
                text,
            });
            this.logger.log(`Admin order cancellation alert dispatched to ${recipient} for ${params.orderNumber} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to dispatch admin order cancellation alert to ${recipient} for ${params.orderNumber}: ${error.message}`);
            return false;
        }
        finally {
            transporter.close();
        }
    }
};
MailService = MailService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], MailService);
export { MailService };
//# sourceMappingURL=mail.service.js.map