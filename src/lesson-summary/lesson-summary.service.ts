import { Injectable } from '@nestjs/common';
import { Level } from '@prisma/client';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { MasteryService } from '../mastery/mastery.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateLessonSummary,
  LessonSummaryResult,
  SummaryModule,
} from './utils/summary-generator';

export interface GenerateSummaryDto {
  module: SummaryModule;
  session_data: Record<string, unknown>;
}

@Injectable()
export class LessonSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
  ) {}

  async generate(
    userId: string,
    dto: GenerateSummaryDto,
  ): Promise<LessonSummaryResult> {
    const [user, recommendation, overview, topPatterns] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      }),
      this.masteryService.getRecommendation(userId),
      this.masteryService.getOverview(userId),
      this.errorPatternsService.getTopErrorPatterns(userId, 5),
    ]);

    const weakConcepts = overview.weakest
      .filter((item) => item.module === dto.module)
      .map((item) => item.concept);

    const sessionData = {
      ...dto.session_data,
      error_patterns: topPatterns
        .filter((item) => item.module === dto.module)
        .map((item) => ({
          concept: item.concept,
          error_type: item.error_type,
          count: item.count,
          example: item.examples[0] ?? '',
        })),
    };

    return generateLessonSummary({
      module: dto.module,
      level: mapPrismaLevel(user?.level ?? Level.A2),
      sessionData,
      weakConcepts,
      recommendedConcept:
        recommendation.recommended_module === dto.module
          ? recommendation.recommended_concept
          : undefined,
    });
  }
}

function mapPrismaLevel(level: Level): LearnerLevel {
  switch (level) {
    case Level.A1:
    case Level.A2:
      return 'beginner';
    case Level.B1:
      return 'intermediate';
    case Level.B2:
    default:
      return 'advanced';
  }
}
