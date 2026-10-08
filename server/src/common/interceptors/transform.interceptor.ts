import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginationMeta } from '../interfaces/api-response.interface.js';

export type StandardResponse<T> = ApiResponse<T>;

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        // Bypass for file streams or raw buffers or headers already sent
        if (res instanceof StreamableFile || Buffer.isBuffer(res)) {
          return res;
        }

        const http = context.switchToHttp();
        const response = http.getResponse();
        if (response && response.headersSent) {
          return res;
        }

        // If the controller already returned a full ApiResponse with success, data, message
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return {
            success: Boolean(res.success),
            message: res.message || 'Request successful',
            data: this.normalizeData(res.data),
          };
        }

        const message =
          res && typeof res === 'object' && 'message' in res && typeof res.message === 'string'
            ? res.message
            : 'Request successful';

        let rawData = res;
        if (res && typeof res === 'object' && 'data' in res) {
          rawData = res.data;
        } else if (
          res &&
          typeof res === 'object' &&
          'message' in res &&
          Object.keys(res).length === 1
        ) {
          rawData = null;
        }

        return {
          success: true,
          message,
          data: this.normalizeData(rawData),
        };
      }),
    );
  }

  private normalizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data ?? null;
    }

    // Do not alter cart, order, or financial objects that contain items
    if ('cartId' in data || 'subtotal' in data || 'orderNumber' in data) {
      return data;
    }

    // Check if data is a paginated structure
    if (Array.isArray(data.items)) {
      if (data.meta && typeof data.meta === 'object') {
        return data;
      }

      // Only treat as pagination if explicit pagination fields are present
      if (
        ('page' in data && 'limit' in data) ||
        ('page' in data && 'total' in data) ||
        'totalPages' in data
      ) {
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || (data.items.length || 20);
        const total = Number(data.total) || data.items.length;
        const totalPages =
          Number(data.totalPages) || Math.ceil(total / Math.max(limit, 1)) || 1;
        const hasNext =
          typeof data.hasNext === 'boolean'
            ? data.hasNext
            : page < totalPages;
        const hasPrevious =
          typeof data.hasPrevious === 'boolean'
            ? data.hasPrevious
            : page > 1;

        const meta: PaginationMeta = {
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
}
