var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SteadfastApiClient_1;
import { BadGatewayException, BadRequestException, GatewayTimeoutException, Injectable, InternalServerErrorException, Logger, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_STEADFAST_BASE_URL, DEFAULT_STEADFAST_TIMEOUT, } from '../constants/courier.constants.js';
let SteadfastApiClient = SteadfastApiClient_1 = class SteadfastApiClient {
    configService;
    logger = new Logger(SteadfastApiClient_1.name);
    baseUrl;
    apiKey;
    secretKey;
    timeoutMs;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = (this.configService.get('STEADFAST_BASE_URL') ||
            DEFAULT_STEADFAST_BASE_URL).replace(/\/+$/, '');
        this.apiKey = this.configService.get('STEADFAST_API_KEY') || '';
        this.secretKey = this.configService.get('STEADFAST_SECRET_KEY') || '';
        this.timeoutMs = Number(this.configService.get('STEADFAST_TIMEOUT') || DEFAULT_STEADFAST_TIMEOUT);
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    isConfigured() {
        return Boolean(this.apiKey && this.secretKey);
    }
    async request(endpoint, options = {}) {
        if (!this.apiKey || !this.secretKey) {
            throw new InternalServerErrorException('Steadfast API credentials (API Key or Secret Key) are not configured on the server.');
        }
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const method = options.method || 'GET';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        const startTime = Date.now();
        try {
            this.logger.log(`[Steadfast HTTP] ${method} ${endpoint} (Timeout: ${this.timeoutMs}ms)`);
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
            let data;
            try {
                data = rawText ? JSON.parse(rawText) : {};
            }
            catch (parseErr) {
                this.logger.error(`[Steadfast HTTP] Non-JSON response received from ${endpoint} (status ${response.status}) in ${duration}ms`);
                throw new BadGatewayException(`Steadfast returned malformed non-JSON response with HTTP status ${response.status}`);
            }
            this.logger.log(`[Steadfast HTTP] ${method} ${endpoint} completed with status ${response.status} in ${duration}ms`);
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new UnauthorizedException('Steadfast authentication failed. Please check merchant API Key and Secret Key.');
                }
                if (response.status === 400 || response.status === 422) {
                    const detailMsg = data?.message ||
                        (data?.errors ? JSON.stringify(data.errors) : 'Invalid parcel details');
                    throw new BadRequestException(`Steadfast validation error: ${detailMsg}`);
                }
                if (response.status >= 500) {
                    throw new BadGatewayException(`Steadfast upstream service error (HTTP ${response.status}): ${data?.message || 'Server Error'}`);
                }
                throw new BadRequestException(`Steadfast request failed with HTTP ${response.status}: ${data?.message || 'Unknown error'}`);
            }
            if (typeof data.status === 'number' && data.status !== 200) {
                const errorMsg = data.message || 'Steadfast rejected request with business status ' + data.status;
                throw new BadRequestException(`Steadfast error (${data.status}): ${errorMsg}`);
            }
            return data;
        }
        catch (err) {
            if (err.name === 'AbortError') {
                this.logger.error(`[Steadfast HTTP] Request to ${endpoint} timed out after ${this.timeoutMs}ms`);
                throw new GatewayTimeoutException(`Steadfast API request timed out after ${this.timeoutMs}ms. Please check network connectivity.`);
            }
            if (err instanceof BadRequestException ||
                err instanceof UnauthorizedException ||
                err instanceof BadGatewayException ||
                err instanceof GatewayTimeoutException ||
                err instanceof InternalServerErrorException) {
                throw err;
            }
            this.logger.error(`[Steadfast HTTP] Network or connection failure calling ${endpoint}: ${err.message}`);
            throw new BadGatewayException(`Failed to communicate with Steadfast courier gateway: ${err.message || 'Network error'}`);
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    async createOrder(payload) {
        return this.request('/create_order', {
            method: 'POST',
            body: payload,
            isCreation: true,
        });
    }
    async getStatusByCid(consignmentId) {
        return this.request(`/status_by_cid/${encodeURIComponent(String(consignmentId))}`);
    }
    async getStatusByInvoice(invoice) {
        return this.request(`/status_by_invoice/${encodeURIComponent(invoice)}`);
    }
    async getStatusByTrackingCode(trackingCode) {
        return this.request(`/status_by_trackingcode/${encodeURIComponent(trackingCode)}`);
    }
    async getBalance() {
        return this.request('/get_balance');
    }
    async createReturnRequest(consignmentId, reason) {
        return this.request('/create_return_request', {
            method: 'POST',
            body: {
                consignment_id: consignmentId,
                reason: reason || 'Customer returned garment at doorstep',
            },
        });
    }
};
SteadfastApiClient = SteadfastApiClient_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], SteadfastApiClient);
export { SteadfastApiClient };
//# sourceMappingURL=steadfast-api.client.js.map