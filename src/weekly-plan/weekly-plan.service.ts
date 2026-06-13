import { Injectable, NotFoundException } from '@nestjs/common';
import { Level } from '@prisma/client';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { SimpleCacheService } from '../common/cache/simple-cache.service';
import { msUntilUtcMidnight, todayUtcKey } from '../home/utils/daily-seed';
import { MasteryService } from '../mastery/mastery.service';
import { MiniLessonsService } from '../mini-lessons/mini-lessons.service';
import { SrsService } from '../srs/srs.service';
import { PredictionService } from '../prediction/prediction.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateWeeklyPlan, WeeklyPlan } from './utils/plan-generator';

@Injectable()
export class WeeklyPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly miniLessonsService: MiniLessonsService,
    private readonly srsService: SrsService,
    private readonly predictionService: PredictionService,
    private readonly cache: SimpleCacheService,
  ) {}

  async getWeeklyPlan(userId: string): Promise<WeeklyPlan> {
    const weekStart = todayUtcKey();
    const cacheKey = `weekly-plan:${userId}:${weekStart}`;

    const cached = this.cache.get<WeeklyPlan>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const overview = await this.masteryService.getOverview(userId);
    const [plan, miniLessons, srsDue, recommendations] = await Promise.all([
      Promise.resolve(
        generateWeeklyPlan(
          userId,
          mapPrismaLevel(user.level ?? Level.A2),
          overview.weakest,
        ),
      ),
      this.miniLessonsService.getLessonsForWeakAreas(userId),
      this.srsService.getDueReviews(userId, 5),
      this.predictionService.getRecommendations(userId),
    ]);

    const enrichedPlan: WeeklyPlan = {
      ...plan,
      mini_lessons: miniLessons.slice(0, 3),
      srs_items: srsDue,
      predictions: recommendations.predictions.slice(0, 5),
    };

    this.cache.set(
      cacheKey,
      enrichedPlan,
      msUntilUtcMidnight() + 6 * 24 * 60 * 60 * 1000,
    );
    return enrichedPlan;
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
