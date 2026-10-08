var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = 'INTERNAL_SERVER_ERROR';
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                errorCode = this.mapStatusToErrorCode(status);
            }
            else if (typeof res === 'object' && res !== null) {
                const errorResponse = res;
                if (Array.isArray(errorResponse.message)) {
                    message = errorResponse.message.join(', ');
                    errorCode = 'VALIDATION_ERROR';
                }
                else if (typeof errorResponse.message === 'string') {
                    message = errorResponse.message;
                    errorCode = errorResponse.error || this.mapStatusToErrorCode(status);
                }
                else {
                    errorCode = this.mapStatusToErrorCode(status);
                }
            }
        }
        else if (this.isPrismaError(exception)) {
            const prismaCode = exception.code;
            if (prismaCode === 'P2002') {
                status = HttpStatus.CONFLICT;
                message = 'A resource with this identifier already exists';
                errorCode = 'DUPLICATE_RESOURCE';
            }
            else if (prismaCode === 'P2025') {
                status = HttpStatus.NOT_FOUND;
                message = 'The requested resource was not found';
                errorCode = 'NOT_FOUND';
            }
            else if (prismaCode === 'P2003') {
                status = HttpStatus.BAD_REQUEST;
                message = 'Referenced entity does not exist';
                errorCode = 'FOREIGN_KEY_VIOLATION';
            }
            else if (prismaCode === 'P2028') {
                this.logger.error(`Prisma error [${prismaCode}]: ${exception.message}`);
                status = HttpStatus.REQUEST_TIMEOUT;
                message = 'Database operation timed out. Please try again.';
                errorCode = 'TRANSACTION_TIMEOUT';
            }
            else {
                this.logger.error(`Prisma error [${prismaCode}]: ${exception.message}`);
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'A database operation error occurred';
                errorCode = 'DATABASE_ERROR';
            }
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
            message = 'An unexpected internal error occurred';
            errorCode = 'INTERNAL_SERVER_ERROR';
        }
        const normalizedErrorCode = errorCode
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toUpperCase();
        response.status(status).json({
            success: false,
            message,
            errorCode: normalizedErrorCode,
            data: null,
        });
    }
    isPrismaError(exception) {
        if (!exception || typeof exception !== 'object')
            return false;
        const name = exception.constructor?.name || '';
        const code = exception.code;
        return name.includes('Prisma') || (typeof code === 'string' && code.startsWith('P'));
    }
    mapStatusToErrorCode(status) {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case HttpStatus.CONFLICT:
                return 'CONFLICT';
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return 'VALIDATION_ERROR';
            case HttpStatus.TOO_MANY_REQUESTS:
                return 'TOO_MANY_REQUESTS';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
};
AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    Catch()
], AllExceptionsFilter);
export { AllExceptionsFilter };
//# sourceMappingURL=all-exceptions.filter.js.map