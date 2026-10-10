import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  renderPasswordResetEmail,
  renderPasswordResetSuccessEmail,
  renderWelcomeEmail,
  renderAccountBannedEmail,
  renderStaffWelcomeEmail,
  renderOrderConfirmationEmail,
  renderOrderStatusUpdateEmail,
  renderOrderEditEmail,
  type OrderConfirmationItem,
  type OrderConfirmationAddress,
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
      if (ordersFrom) {
        return ordersFrom.includes('<') ? ordersFrom : `Rongin Libas Orders <${ordersFrom}>`;
      }
      return 'Rongin Libas Orders <orders@ronginlibas.com>';
    }
    const authFrom =
      this.configService.get<string>('SMTP_FROM') ||
      'Rongin Libas <noreply@ronginlibas.com>';
    return authFrom.includes('<') ? authFrom : `Rongin Libas <${authFrom}>`;
  }

  private getWebUrl(): string {
    return (
      this.configService.get<string>('app.webFrontendUrl') ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  private getAdminUrl(): string {
    return (
      this.configService.get<string>('app.adminFrontendUrl') ||
      'http://localhost:3001'
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

  /**
   * Send notification to customer that their account has been suspended/banned with admin reason
   */
  async sendAccountBannedEmail(email: string, reason: string, name?: string): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

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
    } catch (error) {
      this.logger.warn(`Failed to dispatch account banned email to ${email}: ${(error as Error).message}`);
      return false;
    } finally {
      transporter.close();
    }
  }

  /**
   * Send onboarding credentials email to newly created staff/admin/manager
   */
  async sendStaffWelcomeEmail(params: {
    email: string;
    fullName: string;
    userId: string;
    role: string;
    password: string;
    mustChangePassword?: boolean;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

    const adminUrl = this.getAdminUrl();
    const loginUrl = `${adminUrl}/login`;
    const webUrl = this.getWebUrl();
    const from = this.getFromAddress('auth'); // Uses configured no-reply address

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
    } catch (error) {
      this.logger.warn(`Failed to dispatch staff welcome credentials email to ${params.email}: ${(error as Error).message}`);
      return false;
    } finally {
      transporter.close();
    }
  }

  /**
   * Dispatch Order Confirmation email via orders@ronginlibas.com
   */
  async sendOrderConfirmationEmail(params: {
    email: string;
    orderNumber: string;
    customerName?: string | null;
    items: OrderConfirmationItem[];
    subtotal: number | string;
    deliveryCharge: number | string;
    discountAmount?: number | string;
    totalAmount: number | string;
    paymentMethod: string;
    paymentStatus: string;
    shippingAddress: OrderConfirmationAddress;
    customerNotes?: string | null;
    trackingToken?: string;
    invoiceBuffer?: Buffer;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

    const webUrl = this.getWebUrl();
    const trackQuery = new URLSearchParams();
    trackQuery.set('id', params.orderNumber);
    if (params.trackingToken) {
      trackQuery.set('trackingToken', params.trackingToken);
    }
    const trackUrl = `${webUrl}/track-order?${trackQuery.toString()}`;
    const from = this.getFromAddress('orders');

    const cleanOrderNum = params.orderNumber.replace(/[^a-zA-Z0-9-_]/g, '');

    const { subject, html, text } = renderOrderConfirmationEmail({
      orderNumber: params.orderNumber,
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
    });

    const attachments = params.invoiceBuffer
      ? [
          {
            filename: `Rongin-Libas-Invoice-${cleanOrderNum}.pdf`,
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
      this.logger.log(
        `Order confirmation email dispatched to ${params.email} for ${params.orderNumber} (Invoice attached: ${Boolean(params.invoiceBuffer)}) via ${from} (Message ID: ${info.messageId})`
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to dispatch order confirmation email to ${params.email} for ${params.orderNumber}: ${(error as Error).message}`
      );
      return false;
    } finally {
      transporter.close();
    }
  }

  /**
   * Dispatch Order Status Transition email via orders@ronginlibas.com
   */
  async sendOrderStatusUpdateEmail(params: {
    email: string;
    orderNumber: string;
    customerName?: string | null;
    newStatus: string;
    previousStatus?: string | null;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    estimatedDelivery?: Date | string | null;
    adminNotes?: string | null;
    totalAmount?: number | string | null;
    shippingAddress?: any;
    trackingToken?: string;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

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
      this.logger.log(
        `Order status update email (${params.newStatus}) dispatched to ${params.email} for ${params.orderNumber} via ${from} (Message ID: ${info.messageId})`
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to dispatch order status update email to ${params.email} for ${params.orderNumber}: ${(error as Error).message}`
      );
      return false;
    } finally {
      transporter.close();
    }
  }

  /**
   * Dispatch Order Revision/Edit email via orders@ronginlibas.com
   */
  async sendOrderEditEmail(params: {
    email: string;
    orderNumber: string;
    customerName?: string | null;
    status: string;
    totalAmount?: number | string | null;
    changeSummary?: string[] | null;
    shippingAddress?: any;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    adminNotes?: string | null;
    trackingToken?: string;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

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
      this.logger.log(
        `Order edit email dispatched to ${params.email} for ${params.orderNumber} via ${from} (Message ID: ${info.messageId})`
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to dispatch order edit email to ${params.email} for ${params.orderNumber}: ${(error as Error).message}`
      );
      return false;
    } finally {
      transporter.close();
    }
  }
}
