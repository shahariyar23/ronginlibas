var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, } from '@nestjs/common';
import { map } from 'rxjs/operators';
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe(map((res) => {
            if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
                return res;
            }
            const message = res && typeof res === 'object' && 'message' in res
                ? String(res.message)
                : 'Request processed successfully';
            let data = res;
            if (res && typeof res === 'object' && 'data' in res) {
                data = res.data;
            }
            else if (res && typeof res === 'object' && 'message' in res && Object.keys(res).length === 1) {
                data = null;
            }
            return {
                success: true,
                message,
                data,
            };
        }));
    }
};
TransformInterceptor = __decorate([
    Injectable()
], TransformInterceptor);
export { TransformInterceptor };
//# sourceMappingURL=transform.interceptor.js.map