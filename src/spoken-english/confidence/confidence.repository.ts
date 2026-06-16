import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  formatPrismaError,
  isPrismaForeignKeyError,
  isPrismaSchemaError,
} from '../../common/utils/prisma-error.util';

@Injectable()
export class ConfidenceRepository {
  private readonly logger = new Logger(ConfidenceRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveConfidenceRecord(
    userId: string,
    sessionId: string,
    prompt: string,
    userResponse: string,
    aiFeedback: string,
    confidenceScore: number,
    language: string,
  ) {
    try {
      return await this.prisma.speakingConfidence.create({
        data: {
          userId,
          sessionId,
          prompt,
          userResponse,
          aiFeedback,
          confidenceScore,
          language,
        },
      });
    } catch (error) {
      const formatted = formatPrismaError(error);
      if (isPrismaSchemaError(error)) {
        this.logger.error(
          `speaking_confidence table missing — run prisma migrate deploy (${formatted.code})`,
        );
      } else if (isPrismaForeignKeyError(error)) {
        this.logger.warn(
          `confidence save skipped — user ${userId} not found (${formatted.code})`,
        );
      } else {
        this.logger.error('confidence save failed', error);
      }
      throw error;
    }
  }

  async getUserConfidenceHistory(userId: string, limit = 50) {
    try {
      return await this.prisma.speakingConfidence.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      if (isPrismaSchemaError(error)) {
        this.logger.error(
          'speaking_confidence table missing — returning empty history',
        );
        return [];
      }
      throw error;
    }
  }
}
