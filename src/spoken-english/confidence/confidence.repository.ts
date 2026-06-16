import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfidenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  saveConfidenceRecord(
    userId: string,
    sessionId: string,
    prompt: string,
    userResponse: string,
    aiFeedback: string,
    confidenceScore: number,
    language: string,
  ) {
    return this.prisma.speakingConfidence.create({
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
  }

  getUserConfidenceHistory(userId: string, limit = 50) {
    return this.prisma.speakingConfidence.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
