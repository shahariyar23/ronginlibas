import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the controller already returned { success, message, data }, leave it intact
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return res as StandardResponse<T>;
        }

        const message =
          res && typeof res === 'object' && 'message' in res
            ? String(res.message)
            : 'Request processed successfully';

        let data = res as T;
        if (res && typeof res === 'object' && 'data' in res) {
          data = res.data as T;
        } else if (res && typeof res === 'object' && 'message' in res && Object.keys(res).length === 1) {
          data = null as unknown as T;
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
