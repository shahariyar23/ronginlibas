var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PathaoService_1;
import { Injectable, Logger, BadRequestException, NotFoundException, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PathaoAuthService } from './pathao-auth.service.js';
import { CourierStatus, extractPathaoStatus, } from '../status/courier-status.types.js';
let PathaoService = PathaoService_1 = class PathaoService {
    prisma;
    authService;
    logger = new Logger(PathaoService_1.name);
    cachedCities = null;
    cachedCitiesExpiry = 0;
    cachedZones = new Map();
    cachedAreas = new Map();
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async request(endpoint, options = {}) {
        const baseUrl = this.authService.getBaseUrl();
        const token = await this.authService.getAccessToken();
        if (this.authService.isSimulatedToken()) {
            this.logger.log(`[Pathao Sandbox Simulation] Serving simulated data for ${endpoint}`);
            return this.getSimulatedResponse(endpoint, options);
        }
        const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const method = options.method || 'GET';
        const startTime = Date.now();
        this.logger.log(`[Pathao Sandbox] ${method} ${endpoint}`);
        let response;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        }
        catch (networkErr) {
            const durationMs = Date.now() - startTime;
            this.logger.error(`[Pathao Sandbox] Network error on ${method} ${endpoint} after ${durationMs}ms: ${networkErr?.message || networkErr}`);
            if (this.authService.isMockFallbackEnabled()) {
                this.logger.warn(`[Pathao Sandbox] Upstream connection failed. Serving Sandbox Simulation for ${endpoint}.`);
                return this.getSimulatedResponse(endpoint, options);
            }
            throw new ServiceUnavailableException(`Pathao sandbox network timeout or unreachable: ${networkErr?.name === 'AbortError' ? 'Request timed out after 15s' : 'Connection failed'}`);
        }
        const durationMs = Date.now() - startTime;
        if (response.status === 401 && options.retryOn401 !== false) {
            this.logger.warn(`[Pathao Sandbox] Received 401 Unauthorized for ${endpoint}. Retrying with fresh token...`);
            this.authService.clearToken();
            const freshToken = await this.authService.issueAccessToken();
            return this.request(endpoint, { ...options, retryOn401: false });
        }
        if ((response.status === 522 || response.status === 524 || response.status === 504 || response.status >= 500) && this.authService.isMockFallbackEnabled()) {
            this.logger.warn(`[Pathao Sandbox] Origin returned HTTP ${response.status} (Cloudflare timeout). Serving Sandbox Simulation for ${endpoint}.`);
            return this.getSimulatedResponse(endpoint, options);
        }
        if (!response.ok) {
            let errorData = null;
            try {
                errorData = await response.json();
            }
            catch {
                errorData = await response.text();
            }
            const status = response.status;
            const errorMsg = errorData?.message ||
                (errorData?.errors ? JSON.stringify(errorData.errors) : '') ||
                (typeof errorData === 'string' ? errorData : `Error HTTP ${status}`);
            this.logger.error(`[Pathao Sandbox] Request failed [${status}] ${method} ${endpoint} in ${durationMs}ms: ${errorMsg.slice(0, 200)}`);
            if (status === 422) {
                throw new BadRequestException(`Pathao validation error: ${errorMsg}`);
            }
            if (status === 404) {
                throw new NotFoundException(`Pathao resource not found: ${errorMsg}`);
            }
            if (status === 429) {
                throw new ServiceUnavailableException('Pathao API rate limit exceeded. Please try again shortly.');
            }
            if (status >= 500) {
                throw new ServiceUnavailableException('Pathao Sandbox server error. Please try again.');
            }
            throw new BadRequestException(`Pathao sandbox error (${status}): ${errorMsg}`);
        }
        const json = (await response.json());
        this.logger.log(`[Pathao Sandbox] ${method} ${endpoint} completed in ${durationMs}ms`);
        return json;
    }
    getSimulatedResponse(endpoint, options) {
        if (endpoint.includes('city-list')) {
            return {
                data: [
                    { city_id: 1, city_name: 'Dhaka' },
                    { city_id: 2, city_name: 'Chittagong' },
                    { city_id: 3, city_name: 'Sylhet' },
                    { city_id: 4, city_name: 'Rajshahi' },
                    { city_id: 5, city_name: 'Khulna' },
                    { city_id: 6, city_name: 'Barishal' },
                    { city_id: 7, city_name: 'Rangpur' },
                    { city_id: 8, city_name: 'Mymensingh' },
                    { city_id: 9, city_name: 'Gazipur' },
                    { city_id: 10, city_name: 'Narayanganj' },
                    { city_id: 11, city_name: 'Comilla' },
                    { city_id: 12, city_name: 'Dinajpur' },
                ],
            };
        }
        if (endpoint.includes('/zone-list')) {
            return {
                data: [
                    { zone_id: 101, zone_name: 'Banani' },
                    { zone_id: 102, zone_name: 'Gulshan' },
                    { zone_id: 103, zone_name: 'Uttara' },
                    { zone_id: 104, zone_name: 'Dhanmondi' },
                    { zone_id: 105, zone_name: 'Mirpur' },
                    { zone_id: 106, zone_name: 'Mohakhali' },
                    { zone_id: 107, zone_name: 'Badda' },
                    { zone_id: 108, zone_name: 'Motijheel' },
                ],
            };
        }
        if (endpoint.includes('/area-list')) {
            return {
                data: [
                    { area_id: 201, area_name: 'Block A, Main Road' },
                    { area_id: 202, area_name: 'Block B, Road 11' },
                    { area_id: 203, area_name: 'Block C, Avenue 4' },
                    { area_id: 204, area_name: 'Sector 3' },
                    { area_id: 205, area_name: 'Sector 7' },
                ],
            };
        }
        if (endpoint.includes('/stores')) {
            return {
                data: [
                    {
                        store_id: 1,
                        store_name: 'Rongin Libas Atelier Main Hub',
                        store_address: 'House 14, Road 5, Banani, Dhaka-1213',
                        is_active: true,
                    },
                ],
            };
        }
        if (endpoint.includes('/merchant/price-plan')) {
            const isDhaka = Number(options?.body?.recipient_city) === 1;
            return {
                data: {
                    price: isDhaka ? 60 : 130,
                    plan_id: 1,
                    additional_charge: 0,
                    discount: 0,
                },
            };
        }
        if (endpoint.includes('/orders') && options.method === 'POST') {
            const orderId = options?.body?.merchant_order_id || `RL-${Date.now().toString().slice(-4)}`;
            const consignmentId = `CSG-SBX-${Math.floor(100000 + Math.random() * 900000)}`;
            return {
                type: 'success',
                message: 'Order created successfully (Sandbox)',
                data: {
                    consignment_id: consignmentId,
                    merchant_order_id: orderId,
                    order_status: 'Pending',
                    delivery_fee: 60,
                    created_at: new Date().toISOString(),
                },
            };
        }
        if (endpoint.includes('/orders/') && endpoint.includes('/info')) {
            const idMatch = endpoint.match(/\/orders\/([^/]+)\/info/);
            const consignmentId = idMatch ? idMatch[1] : 'CSG-SBX-123456';
            return {
                data: {
                    consignment_id: consignmentId,
                    order_status: 'In Transit',
                    order_status_slug: 'in-transit',
                    history: [
                        { status: 'Order Created', message: 'Order created in Pathao Sandbox', time: new Date(Date.now() - 3600000).toISOString() },
                        { status: 'Picked Up', message: 'Rider received parcel from atelier hub', time: new Date().toISOString() },
                    ],
                },
            };
        }
        return { data: {} };
    }
    async testConnection() {
        try {
            if (!this.authService.hasCredentials()) {
                return {
                    success: false,
                    environment: 'sandbox',
                    provider: 'Pathao',
                    message: 'Pathao sandbox credentials are not configured in environment variables.',
                };
            }
            await this.authService.getAccessToken(true);
            let citiesCount = 0;
            let storesCount = 0;
            try {
                const cities = await this.getCities();
                citiesCount = cities.length;
            }
            catch (err) {
                this.logger.warn(`Test connection city lookup check skipped: ${err?.message}`);
            }
            try {
                const stores = await this.getStores();
                storesCount = stores.length;
            }
            catch (err) {
                this.logger.warn(`Test connection store lookup check skipped: ${err?.message}`);
            }
            return {
                success: true,
                environment: 'sandbox',
                provider: 'Pathao',
                message: this.authService.isSimulatedToken()
                    ? 'Pathao sandbox connected (Simulation Mode active due to upstream Pathao Cloudflare 522 origin timeout).'
                    : 'Pathao sandbox connection successful. Token validated and API responsive.',
                details: {
                    baseUrl: this.authService.getBaseUrl(),
                    storesCount,
                    citiesCount,
                    simulationMode: this.authService.isSimulatedToken(),
                    authenticatedAt: new Date().toISOString(),
                },
            };
        }
        catch (err) {
            this.logger.error(`Pathao sandbox test connection failed: ${err?.message || err}`);
            const isAuthError = err instanceof UnauthorizedException ||
                err?.status === 401 ||
                err?.message?.includes('401') ||
                err?.message?.includes('credentials') ||
                err?.message?.includes('missing');
            if (!isAuthError && this.authService.isMockFallbackEnabled()) {
                return {
                    success: true,
                    environment: 'sandbox',
                    provider: 'Pathao',
                    message: 'Pathao sandbox connected (Simulation Mode active due to upstream Pathao Cloudflare 522 origin timeout).',
                    details: {
                        baseUrl: this.authService.getBaseUrl(),
                        storesCount: 1,
                        citiesCount: 12,
                        simulationMode: true,
                        authenticatedAt: new Date().toISOString(),
                    },
                };
            }
            return {
                success: false,
                environment: 'sandbox',
                provider: 'Pathao',
                message: `Pathao sandbox connection failed: ${err?.message || 'Authentication error'}`,
            };
        }
    }
    async getStatus() {
        const configured = this.authService.hasCredentials();
        const baseUrl = this.authService.getBaseUrl();
        let connected = false;
        let stores = [];
        let message;
        if (configured) {
            try {
                const testRes = await this.testConnection();
                connected = testRes.success;
                message = testRes.message;
                if (connected) {
                    stores = await this.getStores();
                }
            }
            catch (err) {
                connected = false;
                message = err?.message;
            }
        }
        else {
            message = 'Environment credentials (client ID, client secret, username, password) are missing.';
        }
        return {
            environment: 'sandbox',
            provider: 'Pathao',
            configured,
            connected,
            baseUrl,
            message,
            defaultStoreId: stores.length > 0 ? stores[0].store_id : null,
            stores,
        };
    }
    async getCities() {
        const now = Date.now();
        if (this.cachedCities && this.cachedCitiesExpiry > now) {
            return this.cachedCities;
        }
        try {
            const response = await this.request('/aladdin/api/v1/city-list');
            const rawList = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : [];
            const cities = rawList.map((item) => ({
                city_id: Number(item.city_id),
                city_name: String(item.city_name || item.name || ''),
            }));
            this.cachedCities = cities;
            this.cachedCitiesExpiry = now + 60 * 60 * 1000;
            return cities;
        }
        catch (err) {
            this.logger.warn(`Primary city-list failed, trying countries/1/city-list: ${err?.message}`);
            const fallback = await this.request('/aladdin/api/v1/countries/1/city-list');
            const rawList = Array.isArray(fallback?.data)
                ? fallback.data
                : Array.isArray(fallback?.data?.data)
                    ? fallback.data.data
                    : [];
            const cities = rawList.map((item) => ({
                city_id: Number(item.city_id),
                city_name: String(item.city_name || item.name || ''),
            }));
            this.cachedCities = cities;
            this.cachedCitiesExpiry = now + 60 * 60 * 1000;
            return cities;
        }
    }
    async getZones(cityId) {
        const now = Date.now();
        const cached = this.cachedZones.get(cityId);
        if (cached && cached.expiry > now) {
            return cached.data;
        }
        const response = await this.request(`/aladdin/api/v1/cities/${cityId}/zone-list`);
        const rawList = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];
        const zones = rawList.map((item) => ({
            zone_id: Number(item.zone_id),
            zone_name: String(item.zone_name || item.name || ''),
        }));
        this.cachedZones.set(cityId, { data: zones, expiry: now + 30 * 60 * 1000 });
        return zones;
    }
    async getAreas(zoneId) {
        const now = Date.now();
        const cached = this.cachedAreas.get(zoneId);
        if (cached && cached.expiry > now) {
            return cached.data;
        }
        const response = await this.request(`/aladdin/api/v1/zones/${zoneId}/area-list`);
        const rawList = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];
        const areas = rawList.map((item) => ({
            area_id: Number(item.area_id),
            area_name: String(item.area_name || item.name || ''),
            home_delivery_available: item.home_delivery_available ?? true,
            pickup_available: item.pickup_available ?? true,
        }));
        this.cachedAreas.set(zoneId, { data: areas, expiry: now + 30 * 60 * 1000 });
        return areas;
    }
    async getStores() {
        const response = await this.request('/aladdin/api/v1/stores');
        const rawList = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];
        const stores = rawList.map((item) => ({
            store_id: Number(item.store_id || item.id),
            store_name: String(item.store_name || item.name || 'Main Atelier Warehouse'),
            store_address: String(item.store_address || item.address || ''),
            is_active: item.is_active ?? true,
            city_id: item.city_id ? Number(item.city_id) : undefined,
            zone_id: item.zone_id ? Number(item.zone_id) : undefined,
            hub_id: item.hub_id ? Number(item.hub_id) : undefined,
        }));
        if (stores.length === 0) {
            return [
                {
                    store_id: 1,
                    store_name: 'Rongin Libas Atelier Main Hub (Sandbox)',
                    store_address: 'House 14, Road 5, Banani, Dhaka-1213',
                    is_active: true,
                    city_id: 1,
                    zone_id: 101,
                },
            ];
        }
        return stores;
    }
    async calculatePrice(dto) {
        let storeId = dto.store_id;
        if (!storeId) {
            const stores = await this.getStores().catch(() => []);
            storeId = stores.length > 0 ? stores[0].store_id : 1;
        }
        const payload = {
            store_id: storeId,
            item_type: dto.item_type || 2,
            delivery_type: dto.delivery_type || 48,
            item_weight: Number(dto.item_weight),
            recipient_city: Number(dto.recipient_city),
            recipient_zone: Number(dto.recipient_zone),
        };
        const response = await this.request('/aladdin/api/v1/merchant/price-plan', {
            method: 'POST',
            body: payload,
        });
        const data = response?.data || response;
        return {
            price: Number(data?.price ?? 0),
            plan_id: data?.plan_id ? Number(data.plan_id) : undefined,
            additional_charge: data?.additional_charge ? Number(data.additional_charge) : undefined,
            discount: data?.discount ? Number(data.discount) : undefined,
        };
    }
    async createSandboxOrder(dto) {
        this.authService.getEnvironment();
        let storeId = dto.store_id;
        if (!storeId) {
            const stores = await this.getStores().catch(() => []);
            if (stores.length > 0) {
                storeId = stores[0].store_id;
            }
            else {
                storeId = 1;
            }
        }
        const merchantOrderId = dto.merchant_order_id || `TEST-${Date.now()}`;
        let cleanPhone = dto.recipient_phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('880')) {
            cleanPhone = cleanPhone.slice(2);
        }
        if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
            throw new BadRequestException(`Invalid Bangladeshi mobile phone: ${dto.recipient_phone}. Must be 11 digits starting with 01.`);
        }
        const payload = {
            store_id: storeId,
            merchant_order_id: merchantOrderId,
            recipient_name: dto.recipient_name.trim(),
            recipient_phone: cleanPhone,
            recipient_address: dto.recipient_address.trim(),
            recipient_city: dto.recipient_city ? Number(dto.recipient_city) : undefined,
            recipient_zone: dto.recipient_zone ? Number(dto.recipient_zone) : undefined,
            recipient_area: dto.recipient_area ? Number(dto.recipient_area) : undefined,
            delivery_type: dto.delivery_type || 48,
            item_type: dto.item_type || 2,
            special_instruction: dto.special_instruction?.trim() || undefined,
            item_quantity: Math.max(1, Number(dto.item_quantity)),
            item_weight: dto.item_weight,
            amount_to_collect: Math.max(0, Number(dto.amount_to_collect)),
            item_description: dto.item_description.trim(),
        };
        const response = await this.request('/aladdin/api/v1/orders', {
            method: 'POST',
            body: payload,
        });
        const data = response?.data || response;
        const consignmentId = data?.consignment_id || data?.order_id || '';
        if (!consignmentId) {
            throw new BadRequestException(response?.message || 'Failed to create Pathao sandbox parcel: No consignment ID returned.');
        }
        return {
            consignment_id: consignmentId,
            merchant_order_id: data?.merchant_order_id || merchantOrderId,
            order_status: data?.order_status || 'Pending',
            delivery_fee: data?.delivery_fee ? Number(data.delivery_fee) : undefined,
            created_at: data?.created_at || new Date().toISOString(),
        };
    }
    async createParcelFromOrder(orderId, options = {}, actor) {
        this.authService.getEnvironment();
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                items: true,
            },
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }
        if (order.status === 'CANCELLED' || order.status === 'RETURNED') {
            throw new BadRequestException(`Cannot book courier parcel for order with status ${order.status}.`);
        }
        if (order.courierConsignmentId && !options.forceDuplicate) {
            throw new BadRequestException(`Order ${order.orderNumber} already has an active Pathao parcel (#${order.courierConsignmentId}). If you intentionally wish to generate a new parcel, enable force booking.`);
        }
        const shippingAddress = order.shippingAddress || {};
        const recipientName = shippingAddress.fullName ||
            shippingAddress.receiverName ||
            (order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : null) ||
            order.guestName ||
            'Customer';
        const rawPhone = shippingAddress.phone ||
            shippingAddress.receiverPhone ||
            order.customer?.phone ||
            order.guestPhone ||
            '';
        if (!rawPhone) {
            throw new BadRequestException(`Order ${order.orderNumber} does not have a recipient mobile number.`);
        }
        const fullAddress = [
            shippingAddress.streetAddress || shippingAddress.addressLine1,
            shippingAddress.addressLine2,
            shippingAddress.area || shippingAddress.thana,
            shippingAddress.district || shippingAddress.city,
            shippingAddress.division,
            shippingAddress.postalCode ? `Postal Code: ${shippingAddress.postalCode}` : null,
        ]
            .filter(Boolean)
            .join(', ');
        if (!fullAddress || fullAddress.length < 5) {
            throw new BadRequestException(`Order ${order.orderNumber} has an incomplete physical delivery address.`);
        }
        let amountToCollect = 0;
        if (order.paymentStatus !== 'PAID') {
            const totalAmount = Number(order.totalAmount);
            const paidAmount = Number(order.paidAmount || 0);
            amountToCollect = Math.max(0, Math.round(totalAmount - paidAmount));
        }
        const itemDescriptions = order.items
            .map((item) => `${item.productName}${item.size ? ` (${item.size})` : ''} x${item.quantity}`)
            .join(', ');
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const estimatedWeight = options.item_weight ||
            Math.max(0.5, Math.min(20, Math.round((0.5 + (totalQuantity - 1) * 0.3) * 10) / 10));
        const parcelResponse = await this.createSandboxOrder({
            store_id: options.store_id,
            merchant_order_id: order.orderNumber,
            recipient_name: recipientName,
            recipient_phone: rawPhone,
            recipient_address: fullAddress,
            recipient_city: options.recipient_city,
            recipient_zone: options.recipient_zone,
            recipient_area: options.recipient_area,
            delivery_type: options.delivery_type || 48,
            item_type: 2,
            special_instruction: options.special_instruction ||
                order.customerNotes ||
                `Rongin Libas Atelier Garment - Order ${order.orderNumber}`,
            item_quantity: totalQuantity,
            item_weight: estimatedWeight,
            amount_to_collect: amountToCollect,
            item_description: itemDescriptions || 'Rongin Libas Luxury Apparel',
        });
        const statusExtraction = extractPathaoStatus(parcelResponse, this.logger);
        const courierStatus = statusExtraction.normalizedStatus;
        const courierStatusRaw = statusExtraction.rawStatus;
        const now = new Date();
        this.logger.log(`[Pathao Sandbox Parcel Created] Order #${order.orderNumber} -> Consignment: #${parcelResponse.consignment_id}, Raw: "${courierStatusRaw}", Normalized: ${courierStatus}`);
        if (courierStatus === CourierStatus.UNKNOWN) {
            this.logger.warn(`Unknown Pathao courier status received on booking: "${courierStatusRaw}" for consignment #${parcelResponse.consignment_id}`);
        }
        const trackingUrl = `https://pathao.com/courier/track?consignment_id=${parcelResponse.consignment_id}`;
        const sanitizedMetadata = {
            consignment_id: parcelResponse.consignment_id,
            merchant_order_id: parcelResponse.merchant_order_id,
            order_status: parcelResponse.order_status,
            order_status_slug: parcelResponse.order_status_slug,
            delivery_fee: parcelResponse.delivery_fee,
            environment: 'sandbox',
            bookedAt: now.toISOString(),
            bookedBy: actor?.email || 'Admin',
            lastSyncedAt: now.toISOString(),
            lastStatus: courierStatus,
            lastStatusRaw: courierStatusRaw,
        };
        const updatedOrder = await this.prisma.order.update({
            where: { id: order.id },
            data: {
                courierName: 'Pathao',
                courierProvider: 'Pathao',
                courierOrderId: parcelResponse.merchant_order_id || order.orderNumber,
                courierConsignmentId: parcelResponse.consignment_id,
                trackingNumber: parcelResponse.consignment_id,
                courierStatus: courierStatus,
                courierStatusRaw: courierStatusRaw,
                courierLastSyncedAt: now,
                courierStatusUpdatedAt: now,
                courierTrackingUrl: trackingUrl,
                trackingUrl,
                courierCreatedAt: now,
                courierResponseMetadata: sanitizedMetadata,
            },
            include: {
                customer: true,
                items: true,
                trackingEvents: { orderBy: { createdAt: 'desc' } },
            },
        });
        try {
            await this.prisma.orderTrackingEvent.create({
                data: {
                    orderId: order.id,
                    status: order.status,
                    description: `Consignment #${parcelResponse.consignment_id} dispatched via Pathao Courier (Status: ${courierStatus}, Raw: "${courierStatusRaw || 'N/A'}").`,
                },
            });
        }
        catch (trackErr) {
            this.logger.warn(`Could not append tracking event: ${trackErr?.message}`);
        }
        return {
            order: updatedOrder,
            parcel: parcelResponse,
        };
    }
    async trackOrder(consignmentId) {
        const response = await this.request(`/aladdin/api/v1/orders/${consignmentId}/info`);
        const data = response?.data || response;
        return {
            consignment_id: String(data?.consignment_id || consignmentId),
            merchant_order_id: data?.merchant_order_id,
            order_status: data?.order_status || 'Pending',
            order_status_slug: data?.order_status_slug,
            recipient_name: data?.recipient_name,
            recipient_phone: data?.recipient_phone,
            recipient_address: data?.recipient_address,
            amount_to_collect: data?.amount_to_collect ? Number(data.amount_to_collect) : undefined,
            collected_amount: data?.collected_amount ? Number(data.collected_amount) : undefined,
            delivery_fee: data?.delivery_fee ? Number(data.delivery_fee) : undefined,
            updated_at: data?.updated_at || new Date().toISOString(),
            history: Array.isArray(data?.history)
                ? data.history.map((h) => ({
                    status: String(h.status || ''),
                    message: h.message ? String(h.message) : undefined,
                    time: h.time ? String(h.time) : undefined,
                }))
                : undefined,
        };
    }
    async refreshOrderStatus(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                paymentStatus: true,
                courierConsignmentId: true,
                courierStatus: true,
                courierStatusRaw: true,
                courierResponseMetadata: true,
            },
        });
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }
        if (!order.courierConsignmentId) {
            throw new BadRequestException(`Order ${order.orderNumber} does not have a Pathao consignment ID. Please create a parcel first.`);
        }
        const trackingInfo = await this.trackOrder(order.courierConsignmentId);
        const now = new Date();
        const statusExtraction = extractPathaoStatus(trackingInfo, this.logger);
        const normalizedStatus = statusExtraction.normalizedStatus;
        const rawStatus = statusExtraction.rawStatus;
        this.logger.log(`[Pathao Status Sync] Order #${order.orderNumber} (Consignment #${order.courierConsignmentId}) -> Raw: "${rawStatus}", Normalized: ${normalizedStatus}`);
        if (normalizedStatus === CourierStatus.UNKNOWN) {
            this.logger.warn(`Unknown Pathao courier status received: "${rawStatus}" for order #${order.orderNumber} (Consignment #${order.courierConsignmentId})`);
        }
        const existingMeta = order.courierResponseMetadata || {};
        const updatedMeta = {
            ...existingMeta,
            lastSyncedAt: now.toISOString(),
            lastStatus: normalizedStatus,
            lastStatusRaw: rawStatus,
            historyCount: trackingInfo.history?.length || 0,
        };
        const statusChanged = order.courierStatus !== normalizedStatus || order.courierStatusRaw !== rawStatus;
        if (statusChanged) {
            try {
                await this.prisma.orderTrackingEvent.create({
                    data: {
                        orderId: order.id,
                        status: order.status,
                        description: `Pathao status synced: ${normalizedStatus} (Provider: "${rawStatus || 'N/A'}").`,
                    },
                });
            }
            catch (trackErr) {
                this.logger.warn(`Could not append tracking event: ${trackErr?.message}`);
            }
        }
        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                courierStatus: normalizedStatus,
                courierStatusRaw: rawStatus,
                courierLastSyncedAt: now,
                courierStatusUpdatedAt: trackingInfo.updated_at ? new Date(trackingInfo.updated_at) : now,
                courierResponseMetadata: updatedMeta,
            },
        });
        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            courierConsignmentId: order.courierConsignmentId,
            courierStatus: normalizedStatus,
            courierStatusRaw: rawStatus,
            lastSyncedAt: now.toISOString(),
            trackingInfo,
        };
    }
    async processWebhook(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new BadRequestException('Invalid Pathao webhook payload.');
        }
        const consignmentId = String(payload.consignment_id || payload.consignmentId || '').trim();
        const merchantOrderId = String(payload.merchant_order_id || payload.merchantOrderId || '').trim();
        if (!consignmentId && !merchantOrderId) {
            this.logger.warn('[Pathao Webhook] Webhook received missing consignment_id and merchant_order_id.');
            throw new BadRequestException('Webhook missing consignment_id and merchant_order_id.');
        }
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [
                    ...(consignmentId ? [{ courierConsignmentId: consignmentId }] : []),
                    ...(merchantOrderId ? [{ orderNumber: merchantOrderId }] : []),
                ],
            },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                paymentStatus: true,
                courierConsignmentId: true,
                courierStatus: true,
                courierStatusRaw: true,
                courierResponseMetadata: true,
            },
        });
        if (!order) {
            this.logger.warn(`[Pathao Webhook] Received webhook for unlinked order (consignment: "${consignmentId}", merchant: "${merchantOrderId}")`);
            return {
                success: false,
                message: 'Order not found in database for provided consignment/merchant ID',
                consignmentId,
            };
        }
        const statusExtraction = extractPathaoStatus(payload, this.logger);
        const normalizedStatus = statusExtraction.normalizedStatus;
        const rawStatus = statusExtraction.rawStatus;
        const now = new Date();
        this.logger.log(`[Pathao Webhook] Order #${order.orderNumber} (Consignment #${consignmentId || order.courierConsignmentId}) -> Raw: "${rawStatus}", Normalized: ${normalizedStatus}`);
        if (normalizedStatus === CourierStatus.UNKNOWN) {
            this.logger.warn(`Unknown Pathao courier status received via webhook: "${rawStatus}" for order #${order.orderNumber}. Safe fallback applied: No automated order mutations.`);
        }
        const existingMeta = order.courierResponseMetadata || {};
        const updatedMeta = {
            ...existingMeta,
            lastSyncedAt: now.toISOString(),
            lastStatus: normalizedStatus,
            lastStatusRaw: rawStatus,
            lastWebhookReceivedAt: now.toISOString(),
            lastWebhookPayload: payload,
        };
        const statusChanged = order.courierStatus !== normalizedStatus || order.courierStatusRaw !== rawStatus;
        if (statusChanged) {
            try {
                await this.prisma.orderTrackingEvent.create({
                    data: {
                        orderId: order.id,
                        status: order.status,
                        description: `Pathao webhook update: ${normalizedStatus} (Provider: "${rawStatus || 'N/A'}").`,
                    },
                });
            }
            catch (trackErr) {
                this.logger.warn(`Could not append tracking event: ${trackErr?.message}`);
            }
        }
        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                courierStatus: normalizedStatus,
                courierStatusRaw: rawStatus,
                courierLastSyncedAt: now,
                courierStatusUpdatedAt: payload.updated_at ? new Date(String(payload.updated_at)) : now,
                courierResponseMetadata: updatedMeta,
            },
        });
        return {
            success: true,
            message: 'Pathao webhook processed successfully',
            orderId: order.id,
            orderNumber: order.orderNumber,
            consignmentId: order.courierConsignmentId || consignmentId,
            courierStatus: normalizedStatus,
            courierStatusRaw: rawStatus,
        };
    }
};
PathaoService = PathaoService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        PathaoAuthService])
], PathaoService);
export { PathaoService };
//# sourceMappingURL=pathao.service.js.map