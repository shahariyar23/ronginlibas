var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SteadfastCourierProvider_1;
import { Injectable, Logger } from '@nestjs/common';
import { SteadfastApiClient } from '../client/steadfast-api.client.js';
import { COURIER_STEADFAST, STEADFAST_TRACKING_BASE_URL, } from '../constants/courier.constants.js';
import { normalizeSteadfastStatus } from '../status/steadfast-status.mapper.js';
let SteadfastCourierProvider = SteadfastCourierProvider_1 = class SteadfastCourierProvider {
    client;
    name = COURIER_STEADFAST;
    logger = new Logger(SteadfastCourierProvider_1.name);
    constructor(client) {
        this.client = client;
    }
    async createShipment(input) {
        this.logger.log(`[Steadfast Live] Creating shipment for Order ${input.orderNumber} (Invoice: ${input.invoiceNumber}, COD: ৳${input.codAmount})`);
        const res = await this.client.createOrder({
            invoice: input.invoiceNumber,
            recipient_name: input.recipientName,
            recipient_phone: input.recipientPhone,
            recipient_address: input.recipientAddress,
            cod_amount: input.codAmount,
            note: input.note,
        });
        const consignment = res.consignment;
        if (!consignment) {
            throw new Error(res.message || 'Steadfast response did not contain consignment details');
        }
        const rawStatus = consignment.status || 'in_review';
        const normalizedStatus = normalizeSteadfastStatus(rawStatus);
        const trackingCode = consignment.tracking_code || String(consignment.consignment_id);
        const trackingUrl = `${STEADFAST_TRACKING_BASE_URL}/${encodeURIComponent(trackingCode)}`;
        return {
            consignmentId: String(consignment.consignment_id),
            trackingCode,
            providerInvoice: consignment.invoice || input.invoiceNumber,
            status: normalizedStatus,
            providerStatus: rawStatus,
            codAmount: Number(consignment.cod_amount ?? input.codAmount),
            trackingUrl,
            rawResponse: res,
        };
    }
    async getStatusByConsignmentId(consignmentId) {
        const res = await this.client.getStatusByCid(consignmentId);
        const rawStatus = res.delivery_status || 'unknown';
        const normalized = normalizeSteadfastStatus(rawStatus);
        return {
            consignmentId: String(consignmentId),
            status: normalized,
            providerStatus: rawStatus,
            rawResponse: res,
        };
    }
    async getStatusByInvoice(invoice) {
        const res = await this.client.getStatusByInvoice(invoice);
        const rawStatus = res.delivery_status || 'unknown';
        const normalized = normalizeSteadfastStatus(rawStatus);
        return {
            providerInvoice: invoice,
            status: normalized,
            providerStatus: rawStatus,
            rawResponse: res,
        };
    }
    async getStatusByTrackingCode(trackingCode) {
        const res = await this.client.getStatusByTrackingCode(trackingCode);
        const rawStatus = res.delivery_status || 'unknown';
        const normalized = normalizeSteadfastStatus(rawStatus);
        return {
            trackingCode,
            status: normalized,
            providerStatus: rawStatus,
            rawResponse: res,
        };
    }
    async getBalance() {
        const res = await this.client.getBalance();
        return {
            currentBalance: Number(res.current_balance || 0),
            currency: 'BDT',
            rawResponse: res,
        };
    }
    async createReturnRequest(consignmentId, reason) {
        const res = await this.client.createReturnRequest(consignmentId, reason);
        return {
            success: res.status === 200,
            message: res.message || 'Return request processed',
            consignmentId: String(consignmentId),
            rawResponse: res,
        };
    }
    async healthCheck() {
        const configured = this.client.isConfigured();
        let connected = false;
        let message = 'Steadfast Live provider configured';
        if (!configured) {
            return {
                enabled: true,
                mode: 'live',
                provider: this.name,
                configured: false,
                connected: false,
                baseUrl: this.client.getBaseUrl(),
                message: 'Steadfast Live mode is enabled, but API_KEY or SECRET_KEY is missing.',
            };
        }
        try {
            await this.client.getBalance();
            connected = true;
            message = 'Connected to Steadfast Live API successfully';
        }
        catch (err) {
            connected = false;
            message = `Failed to connect to Steadfast Live API: ${err.message}`;
        }
        return {
            enabled: true,
            mode: 'live',
            provider: this.name,
            configured,
            connected,
            baseUrl: this.client.getBaseUrl(),
            message,
        };
    }
};
SteadfastCourierProvider = SteadfastCourierProvider_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [SteadfastApiClient])
], SteadfastCourierProvider);
export { SteadfastCourierProvider };
//# sourceMappingURL=steadfast.provider.js.map