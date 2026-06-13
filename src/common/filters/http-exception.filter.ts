import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { errorResponse } from '../dto/api-response.dto';
import {
  DATABASE_UNAVAILABLE_CODE,
  DATABASE_UNAVAILABLE_MESSAGE,
  formatPrismaError,
  isPrismaConnectionError,
} from '../utils/prisma-error.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDebug = process.env.NODE_ENV !== 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (isPrismaConnectionError(exception)) {
      const formatted = formatPrismaError(exception);
      this.logger.error(
        JSON.stringify({
          event: 'database_request_failed',
          method: request.method,
          path: request.url,
          code: formatted.code,
          message: formatted.message,
        }),
      );

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json(
        errorResponse(
          DATABASE_UNAVAILABLE_CODE,
          DATABASE_UNAVAILABLE_MESSAGE,
          this.isDebug ? { prismaCode: formatted.code } : undefined,
        ),
      );
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.codeFromStatus(status);
      } else if (typeof exceptionResponse === 'object') {
        const body = exceptionResponse as Record<string, unknown>;
        message = (body.message as string) ?? message;
        code = (body.error as string) ?? this.codeFromStatus(status);
        details = body.details;

        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
          code = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      const formatted = formatPrismaError(exception);
      if (formatted.code !== 'UNKNOWN') {
        this.logger.error(
          JSON.stringify({
            event: 'prisma_error',
            method: request.method,
            path: request.url,
            code: formatted.code,
            message: formatted.message,
          }),
        );
      } else if (this.isDebug) {
        this.logger.error(
          `${request.method} ${request.url} — ${exception.message}`,
          exception.stack,
        );
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR && this.isDebug) {
      this.logger.error(
        `${request.method} ${request.url} ${status} ${code}: ${message}`,
      );
    }

    response.status(status).json(errorResponse(code, message, details));
  }

  private codeFromStatus(status: number): string {
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
      case HttpStatus.SERVICE_UNAVAILABLE:
        return DATABASE_UNAVAILABLE_CODE;
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
