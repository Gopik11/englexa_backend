import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ErrorPatternModule } from '../error-patterns/entities/error-pattern.entity';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { MasteryModule } from '../mastery/entities/concept-mastery.entity';
import { MasteryService } from '../mastery/mastery.service';
import { ProfileService } from '../profile/profile.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  RecordReviewDto,
  SrsDueItem,
  SrsItem,
  SrsRating,
  SrsReviewHistoryEntry,
  SrsStatus,
} from './entities/srs.entity';
import { buildReviewContent } from './utils/review-content';
import { srsReviewClient, SrsRow } from './utils/prisma-srs';
import {
  applySrsRating,
  defaultEaseFactor,
  defaultInterval,
} from './utils/srs-scheduler';

@Injectable()
export class SrsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly profileService: ProfileService,
  ) {}

  async recordReview(
    userId: string,
    dto: RecordReviewDto,
  ): Promise<SrsItem> {
    const scheduled = await this.scheduleNextReview(
      userId,
      dto.module,
      dto.concept,
      dto.rating,
    );

    await this.updateMasteryFromRating(userId, dto.module, dto.concept, dto.rating);

    const srsCorrect = dto.rating === 'good' || dto.rating === 'easy';
    await this.profileService.awardXpForActivity(userId, 'srs_review', {
      perfectAccuracy: srsCorrect,
    });

    return scheduled;
  }

  async scheduleNextReview(
    userId: string,
    module: string,
    concept: string,
    rating: SrsRating,
  ): Promise<SrsItem> {
    const existing = await srsReviewClient(this.prisma).findUnique({
      where: {
        userId_module_concept: { userId, module, concept },
      },
    });

    const now = new Date();
    const currentInterval = existing?.interval ?? defaultInterval();
    const currentEase = existing?.easeFactor ?? defaultEaseFactor();
    const history = parseHistory(existing?.reviewHistory);

    const schedule = applySrsRating({
      interval: currentInterval,
      ease_factor: currentEase,
      rating,
    });

    const entry: SrsReviewHistoryEntry = { date: now, rating };
    const review_history = [...history, entry].slice(-30);

    const row = await srsReviewClient(this.prisma).upsert({
      where: {
        userId_module_concept: { userId, module, concept },
      },
      create: {
        userId,
        module,
        concept,
        lastReviewedAt: now,
        nextReviewAt: schedule.next_review,
        interval: schedule.interval,
        easeFactor: schedule.ease_factor,
        reviewHistory: review_history,
      },
      update: {
        lastReviewedAt: now,
        nextReviewAt: schedule.next_review,
        interval: schedule.interval,
        easeFactor: schedule.ease_factor,
        reviewHistory: review_history,
      },
    });

    return mapRow(row);
  }

  async getDueReviews(userId: string, limit = 10): Promise<SrsDueItem[]> {
    await this.ensureSeededReviews(userId);

    const now = new Date();
    const rows = await srsReviewClient(this.prisma).findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      orderBy: { nextReviewAt: 'asc' },
    });

    return rows.slice(0, limit).map((row) => ({
      ...mapRow(row),
      content: buildReviewContent(row.module, row.concept),
    }));
  }

  async getSrsStatus(userId: string): Promise<SrsStatus> {
    await this.ensureSeededReviews(userId);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const [allRows, dueItems] = await Promise.all([
      srsReviewClient(this.prisma).findMany({
        where: { userId },
      }),
      this.getDueReviews(userId, 5),
    ]);

    const reviewedToday = allRows.filter((row) => {
      return row.lastReviewedAt >= startOfDay;
    }).length;

    const due_count = allRows.filter((row) => row.nextReviewAt <= now).length;
    const upcoming_count = allRows.filter((row) => row.nextReviewAt > now).length;

    return {
      total_items: allRows.length,
      due_count,
      reviewed_today: reviewedToday,
      upcoming_count,
      due_items: dueItems,
    };
  }

  async assertUserAccess(requestedUserId: string, currentUserId: string): Promise<void> {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('Cannot access another user\'s SRS data');
    }
  }

  private async updateMasteryFromRating(
    userId: string,
    module: string,
    concept: string,
    rating: SrsRating,
  ): Promise<void> {
    const masteryModule = module as MasteryModule;
    const correct = rating === 'good' || rating === 'easy';

    await this.masteryService.recordConceptActivity(userId, masteryModule, concept, {
      correct,
    });

    if (rating === 'again') {
      await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer: `SRS review: ${concept}`,
        correctAnswer: `Mastered ${concept}`,
        module: module as ErrorPatternModule,
        concept,
        topic: concept,
      });
    }
  }

  private async ensureSeededReviews(userId: string): Promise<void> {
    const count = await srsReviewClient(this.prisma).count({
      where: { userId },
    });
    if (count > 0) {
      return;
    }

    const [overview, topPatterns] = await Promise.all([
      this.masteryService.getOverview(userId),
      this.errorPatternsService.getTopErrorPatterns(userId, 5),
    ]);

    const seeds = new Map<string, { module: string; concept: string }>();

    for (const item of overview.weakest) {
      seeds.set(`${item.module}:${item.concept}`, {
        module: item.module,
        concept: item.concept,
      });
    }

    for (const pattern of topPatterns) {
      seeds.set(`${pattern.module}:${pattern.concept}`, {
        module: pattern.module,
        concept: pattern.concept,
      });
    }

    if (seeds.size === 0) {
      seeds.set('grammar:articles', { module: 'grammar', concept: 'articles' });
      seeds.set('vocabulary:collocations', {
        module: 'vocabulary',
        concept: 'collocations',
      });
    }

    const now = new Date();
    for (const seed of [...seeds.values()].slice(0, 8)) {
      await srsReviewClient(this.prisma).upsert({
        where: {
          userId_module_concept: {
            userId,
            module: seed.module,
            concept: seed.concept,
          },
        },
        create: {
          userId,
          module: seed.module,
          concept: seed.concept,
          lastReviewedAt: now,
          nextReviewAt: now,
          interval: defaultInterval(),
          easeFactor: defaultEaseFactor(),
          reviewHistory: [],
        },
        update: {},
      });
    }
  }
}

function mapRow(row: SrsRow): SrsItem {
  return {
    id: row.id,
    userId: row.userId,
    module: row.module,
    concept: row.concept,
    last_reviewed: row.lastReviewedAt,
    next_review: row.nextReviewAt,
    interval: row.interval,
    ease_factor: row.easeFactor,
    review_history: parseHistory(row.reviewHistory),
  };
}

function parseHistory(raw: unknown): SrsReviewHistoryEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => {
    const entry = item as Record<string, unknown>;
    return {
      date: new Date(entry.date as string),
      rating: entry.rating as SrsReviewHistoryEntry['rating'],
    };
  });
}
