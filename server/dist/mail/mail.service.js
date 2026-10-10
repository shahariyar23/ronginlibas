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
import { renderPasswordResetEmail, renderPasswordResetSuccessEmail, renderWelcomeEmail, } from './templates/index.js';
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
            if (ordersFrom)
                return ordersFrom;
        }
        return (this.configService.get('SMTP_FROM') ||
            'Rongin Libas <noreply@ronginlibas.com>');
    }
    getWebUrl() {
        return (this.configService.get('app.webFrontendUrl') ||
            'http://localhost:3000').replace(/\/$/, '');
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
};
MailService = MailService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], MailService);
export { MailService };
//# sourceMappingURL=mail.service.js.map