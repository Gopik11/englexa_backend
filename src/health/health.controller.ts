import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { errorResponse, successResponse } from '../common/dto/api-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbHealth = await this.prisma.checkHealth();

    return successResponse({
      status: dbHealth.connected ? 'ok' : 'degraded',
      service: 'englexa-api',
      database: dbHealth.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('db')
  async checkDatabase(@Res({ passthrough: true }) res: Response) {
    const dbHealth = await this.prisma.checkHealth();

    if (!dbHealth.connected) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return errorResponse(
        'DATABASE_UNAVAILABLE',
        'Database is unreachable',
        {
          errorCode: dbHealth.errorCode,
          detail: dbHealth.error,
        },
      );
    }

    return successResponse({
      status: 'ok',
      connected: true,
      latencyMs: dbHealth.latencyMs,
      timestamp: new Date().toISOString(),
    });
  }
}
