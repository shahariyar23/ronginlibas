import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_STEADFAST_BASE_URL,
  DEFAULT_STEADFAST_TIMEOUT,
} from '../constants/courier.constants.js';

export interface SteadfastCreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message?: string;
  consignment?: {
    consignment_id: number | string;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    note?: string;
    created_at?: string;
    updated_at?: string;
  };
  errors?: Record<string, string[]>;
}

export interface SteadfastStatusResponse {
  status: number;
  delivery_status: string;
  message?: string;
}

export interface SteadfastBalanceResponse {
  status: number;
  current_balance: number;
  message?: string;
}

@Injectable()
export class SteadfastApiClient {
  private readonly logger = new Logger(SteadfastApiClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('STEADFAST_BASE_URL') ||
      DEFAULT_STEADFAST_BASE_URL
    ).replace(/\/+$/, '');

    this.apiKey = this.configService.get<string>('STEADFAST_API_KEY') || '';
    this.secretKey = this.configService.get<string>('STEADFAST_SECRET_KEY') || '';
    this.timeoutMs = Number(
      this.configService.get<number>('STEADFAST_TIMEOUT') || DEFAULT_STEADFAST_TIMEOUT,
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  /**
   * Helper to perform safe, timeout-controlled HTTP requests to Steadfast API.
   * Strips all secrets from error logs and response objects.
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT';
      body?: Record<string, unknown>;
      isCreation?: boolean;
    } = {},
  ): Promise<T> {
    if (!this.apiKey || !this.secretKey) {
      throw new InternalServerErrorException(
        'Steadfast API credentials (API Key or Secret Key) are not configured on the server.',
      );
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const method = options.method || 'GET';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    const startTime = Date.now();

    try {
      this.logger.log(
        `[Steadfast HTTP] ${method} ${endpoint} (Timeout: ${this.timeoutMs}ms)`,
      );

      const response = await fetch(url, {
        method,
        headers: {
          'Api-Key': this.apiKey,
          'Secret-Key': this.secretKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;
      const rawText = await response.text();

      let data: any;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        this.logger.error(
          `[Steadfast HTTP] Non-JSON response received from ${endpoint} (status ${response.status}) in ${duration}ms`,
        );
        throw new BadGatewayException(
          `Steadfast returned malformed non-JSON response with HTTP status ${response.status}`,
        );
      }

      this.logger.log(
        `[Steadfast HTTP] ${method} ${endpoint} completed with status ${response.status} in ${duration}ms`,
      );

      // Handle HTTP and Steadfast business status codes
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new UnauthorizedException(
            'Steadfast authentication failed. Please check merchant API Key and Secret Key.',
          );
        }

        if (response.status === 400 || response.status === 422) {
          const detailMsg =
            data?.message ||
            (data?.errors ? JSON.stringify(data.errors) : 'Invalid parcel details');
          throw new BadRequestException(`Steadfast validation error: ${detailMsg}`);
        }

        if (response.status >= 500) {
          throw new BadGatewayException(
            `Steadfast upstream service error (HTTP ${response.status}): ${data?.message || 'Server Error'}`,
          );
        }

        throw new BadRequestException(
          `Steadfast request failed with HTTP ${response.status}: ${data?.message || 'Unknown error'}`,
        );
      }

      // Check Steadfast payload status code if encapsulated (Steadfast returns { status: 200, ... } or { status: 400, ... })
      if (typeof data.status === 'number' && data.status !== 200) {
        const errorMsg = data.message || 'Steadfast rejected request with business status ' + data.status;
        throw new BadRequestException(`Steadfast error (${data.status}): ${errorMsg}`);
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.logger.error(
          `[Steadfast HTTP] Request to ${endpoint} timed out after ${this.timeoutMs}ms`,
        );
        throw new GatewayTimeoutException(
          `Steadfast API request timed out after ${this.timeoutMs}ms. Please check network connectivity.`,
        );
      }

      // Re-throw Nest HTTP exceptions
      if (err instanceof BadRequestException ||
          err instanceof UnauthorizedException ||
          err instanceof BadGatewayException ||
          err instanceof GatewayTimeoutException ||
          err instanceof InternalServerErrorException) {
        throw err;
      }

      this.logger.error(
        `[Steadfast HTTP] Network or connection failure calling ${endpoint}: ${err.message}`,
      );
      throw new BadGatewayException(
        `Failed to communicate with Steadfast courier gateway: ${err.message || 'Network error'}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Creates a parcel booking on Steadfast.
   * NOTE: Retries are strictly disabled for create operations to prevent duplicate consignments.
   */
  async createOrder(payload: SteadfastCreateOrderPayload): Promise<SteadfastCreateOrderResponse> {
    return this.request<SteadfastCreateOrderResponse>('/create_order', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      isCreation: true,
    });
  }

  /**
   * Look up delivery status by Steadfast Consignment ID (CID).
   */
  async getStatusByCid(consignmentId: string | number): Promise<SteadfastStatusResponse> {
    return this.request<SteadfastStatusResponse>(
      `/status_by_cid/${encodeURIComponent(String(consignmentId))}`,
    );
  }

  /**
   * Look up delivery status by Merchant Invoice identifier.
   */
  async getStatusByInvoice(invoice: string): Promise<SteadfastStatusResponse> {
    return this.request<SteadfastStatusResponse>(
      `/status_by_invoice/${encodeURIComponent(invoice)}`,
    );
  }

  /**
   * Look up delivery status by Steadfast Tracking Code.
   */
  async getStatusByTrackingCode(trackingCode: string): Promise<SteadfastStatusResponse> {
    return this.request<SteadfastStatusResponse>(
      `/status_by_trackingcode/${encodeURIComponent(trackingCode)}`,
    );
  }

  /**
   * Get merchant current Steadfast account balance.
   */
  async getBalance(): Promise<SteadfastBalanceResponse> {
    return this.request<SteadfastBalanceResponse>('/get_balance');
  }

  /**
   * Create return request.
   */
  async createReturnRequest(
    consignmentId: string | number,
    reason?: string,
  ): Promise<{ status: number; message: string }> {
    return this.request<{ status: number; message: string }>('/create_return_request', {
      method: 'POST',
      body: {
        consignment_id: consignmentId,
        reason: reason || 'Customer returned garment at doorstep',
      },
    });
  }
}
