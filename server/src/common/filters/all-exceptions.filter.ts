import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorCode = this.mapStatusToErrorCode(status);
      } else if (typeof res === 'object' && res !== null) {
        const errorResponse = res as Record<string, unknown>;
        if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message.join(', ');
          errorCode = 'VALIDATION_ERROR';
        } else if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
          errorCode = (errorResponse.error as string) || this.mapStatusToErrorCode(status);
        } else {
          errorCode = this.mapStatusToErrorCode(status);
        }
      }
    } else if (this.isPrismaError(exception)) {
      const prismaCode = (exception as any).code;
      if (prismaCode === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A resource with this identifier already exists';
        errorCode = 'DUPLICATE_RESOURCE';
      } else if (prismaCode === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested resource was not found';
        errorCode = 'NOT_FOUND';
      } else if (prismaCode === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced entity does not exist';
        errorCode = 'FOREIGN_KEY_VIOLATION';
      } else {
        this.logger.error(`Prisma error [${prismaCode}]: ${(exception as Error).message}`);
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'A database operation error occurred';
        errorCode = 'DATABASE_ERROR';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = 'An unexpected internal error occurred';
      errorCode = 'INTERNAL_SERVER_ERROR';
    }

    // Standardize error code format (UPPER_SNAKE_CASE)
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

  private isPrismaError(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') return false;
    const name = (exception as any).constructor?.name || '';
    const code = (exception as any).code;
    return name.includes('Prisma') || (typeof code === 'string' && code.startsWith('P'));
  }

  private mapStatusToErrorCode(status: number): string {
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
}
