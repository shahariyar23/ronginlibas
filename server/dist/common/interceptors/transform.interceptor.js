var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, StreamableFile, } from '@nestjs/common';
import { map } from 'rxjs/operators';
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe(map((res) => {
            if (res instanceof StreamableFile || Buffer.isBuffer(res)) {
                return res;
            }
            const http = context.switchToHttp();
            const response = http.getResponse();
            if (response && response.headersSent) {
                return res;
            }
            if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
                return {
                    success: Boolean(res.success),
                    message: res.message || 'Request successful',
                    data: this.normalizeData(res.data),
                };
            }
            const message = res && typeof res === 'object' && 'message' in res && typeof res.message === 'string'
                ? res.message
                : 'Request successful';
            let rawData = res;
            if (res && typeof res === 'object' && 'data' in res) {
                rawData = res.data;
            }
            else if (res &&
                typeof res === 'object' &&
                'message' in res &&
                Object.keys(res).length === 1) {
                rawData = null;
            }
            return {
                success: true,
                message,
                data: this.normalizeData(rawData),
            };
        }));
    }
    normalizeData(data) {
        if (!data || typeof data !== 'object') {
            return data ?? null;
        }
        if ('cartId' in data || 'subtotal' in data || 'orderNumber' in data) {
            return data;
        }
        if (Array.isArray(data.items)) {
            if (data.meta && typeof data.meta === 'object') {
                return data;
            }
            if (('page' in data && 'limit' in data) ||
                ('page' in data && 'total' in data) ||
                'totalPages' in data) {
                const page = Number(data.page) || 1;
                const limit = Number(data.limit) || (data.items.length || 20);
                const total = Number(data.total) || data.items.length;
                const totalPages = Number(data.totalPages) || Math.ceil(total / Math.max(limit, 1)) || 1;
                const hasNext = typeof data.hasNext === 'boolean'
                    ? data.hasNext
                    : page < totalPages;
                const hasPrevious = typeof data.hasPrevious === 'boolean'
                    ? data.hasPrevious
                    : page > 1;
                const meta = {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext,
                    hasPrevious,
                };
                return {
                    ...data,
                    items: data.items,
                    meta,
                };
            }
        }
        return data;
    }
};
TransformInterceptor = __decorate([
    Injectable()
], TransformInterceptor);
export { TransformInterceptor };
//# sourceMappingURL=transform.interceptor.js.map