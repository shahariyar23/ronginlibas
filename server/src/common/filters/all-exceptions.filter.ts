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
        errorCode = exception.name.toUpperCase();
      } else if (typeof res === 'object' && res !== null) {
        const errorResponse = res as Record<string, unknown>;
        if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message.join(', ');
        } else if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        }
        errorCode = (errorResponse.error as string) || exception.name.toUpperCase();
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = 'An unexpected error occurred while processing your request';
      errorCode = 'UNEXPECTED_ERROR';
    }

    response.status(status).json({
      success: false,
      message,
      errorCode,
    });
  }
}
