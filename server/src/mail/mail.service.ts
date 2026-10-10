import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  renderPasswordResetEmail,
  renderPasswordResetSuccessEmail,
  renderWelcomeEmail,
} from './templates/index.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter | null {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';

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

  private getFromAddress(type: 'auth' | 'orders' = 'auth'): string {
    if (type === 'orders') {
      const ordersFrom = this.configService.get<string>('SMTP_FROM_ORDERS');
      if (ordersFrom) return ordersFrom;
    }
    return (
      this.configService.get<string>('SMTP_FROM') ||
      'Rongin Libas <noreply@ronginlibas.com>'
    );
  }

  private getWebUrl(): string {
    return (
      this.configService.get<string>('app.webFrontendUrl') ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  /**
   * Send fancy Password Reset Request email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    } finally {
      transporter.close();
    }
  }

  /**
   * Send fancy Password Reset Success confirmation email
   */
  async sendPasswordResetSuccessEmail(email: string, name?: string): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

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
    } catch (error) {
      this.logger.warn(`Failed to dispatch password reset success notification to ${email}: ${(error as Error).message}`);
      return false;
    } finally {
      transporter.close();
    }
  }

  /**
   * Send fancy Welcome / Account Creation greeting email
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

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
    } catch (error) {
      this.logger.warn(`Failed to dispatch welcome email to ${email}: ${(error as Error).message}`);
      return false;
    } finally {
      transporter.close();
    }
  }
}
