import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { formatPrismaError } from '../common/utils/prisma-error.util';

const MAX_CONNECT_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

export interface DatabaseHealthStatus {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  errorCode?: string;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  get isConnected(): boolean {
    return this.connected;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.connectWithRetry();
      this.connected = true;
      this.logger.log('Database connection established');
    } catch (error) {
      this.connected = false;
      const formatted = formatPrismaError(error);
      this.logger.error(
        JSON.stringify({
          event: 'database_startup_failed',
          code: formatted.code,
          message: formatted.message,
          hint: 'PostgreSQL may be stopped or the data directory may be corrupted. Check GET /api/v1/health/db',
        }),
      );
      this.logger.warn(
        'Starting API in degraded mode — database-dependent routes will return 503 until connectivity is restored',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.connected = false;
  }

  async connectWithRetry(): Promise<void> {
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_CONNECT_RETRIES; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        lastError = error;
        const formatted = formatPrismaError(error);
        const delayMs = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);

        this.logger.warn(
          JSON.stringify({
            event: 'database_connect_retry',
            attempt: attempt + 1,
            maxAttempts: MAX_CONNECT_RETRIES,
            code: formatted.code,
            message: formatted.message,
            nextRetryMs: attempt < MAX_CONNECT_RETRIES - 1 ? delayMs : null,
          }),
        );

        if (attempt < MAX_CONNECT_RETRIES - 1) {
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }

  async checkHealth(): Promise<DatabaseHealthStatus> {
    const start = Date.now();

    try {
      await this.$queryRaw`SELECT 1`;
      this.connected = true;
      return {
        connected: true,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      this.connected = false;
      const formatted = formatPrismaError(error);
      return {
        connected: false,
        error: formatted.message,
        errorCode: formatted.code,
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
