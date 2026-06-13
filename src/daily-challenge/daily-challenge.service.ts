import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';
import { CachedDataService } from '../common/cache/cached-data.service';
import { Level } from '@prisma/client';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { ErrorPatternModule } from '../error-patterns/entities/error-pattern.entity';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { todayUtcKey } from '../home/utils/daily-seed';
import { MasteryModule } from '../mastery/entities/concept-mastery.entity';
import { MasteryService } from '../mastery/mastery.service';
import { PredictionService } from '../prediction/prediction.service';
import { ProfileService } from '../profile/profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { SrsService } from '../srs/srs.service';
import {
  ChallengePayload,
  DailyChallenge,
  SubmitChallengeResult,
} from './entities/daily-challenge.entity';
import {
  generateChallenge,
  gradeChallengeAnswer,
} from './utils/challenge-generator';
import {
  dailyChallengeClient,
  DailyChallengeRow,
} from './utils/prisma-daily-challenge';

@Injectable()
export class DailyChallengeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly srsService: SrsService,
    private readonly predictionService: PredictionService,
    private readonly profileService: ProfileService,
    private readonly cachedData: CachedDataService,
  ) {}

  async generateDailyChallenge(userId: string): Promise<DailyChallenge> {
    const date = utcDayStart();
    const client = dailyChallengeClient(this.prisma);

    const existing = await client.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (existing) {
      return this.toEntity(existing);
    }

    const challenge = await this.buildChallengeForUser(userId);
    const row = await client.create({
      data: {
        userId,
        date,
        challenge,
        completed: false,
      },
    });

    return this.toEntity(row);
  }

  async getTodayChallenge(userId: string): Promise<DailyChallenge> {
    const date = utcDayStart();
    const client = dailyChallengeClient(this.prisma);

    const existing = await client.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (existing) {
      return this.toEntity(existing);
    }

    return this.generateDailyChallenge(userId);
  }

  async submitChallenge(
    userId: string,
    answer: string,
  ): Promise<SubmitChallengeResult> {
    const challenge = await this.getTodayChallenge(userId);

    if (challenge.completed) {
      throw new BadRequestException('Today\'s challenge is already completed');
    }

    const graded = gradeChallengeAnswer(challenge.challenge, answer);
    await this.applySubmissionEffects(userId, challenge.challenge, answer, graded.correct);

    const client = dailyChallengeClient(this.prisma);
    const row = await client.update({
      where: { id: challenge.id! },
      data: {
        completed: true,
        score: graded.score,
      },
    });

    await this.profileService.awardXpForActivity(userId, 'daily_challenge', {
      perfectAccuracy: graded.correct && graded.score >= 100,
    });

    await this.cachedData.invalidate(CacheKeys.dailyChallenge(userId));
    await this.cachedData.invalidate(CacheKeys.homeData(userId));

    const updated = this.toEntity(row);
    return {
      challenge: updated,
      correct: graded.correct,
      score: graded.score,
      feedback: graded.correct
        ? 'Great work! Challenge completed.'
        : 'Good effort — review the concept and try practice mode.',
    };
  }

  async markCompleted(userId: string, score = 100): Promise<DailyChallenge> {
    const challenge = await this.getTodayChallenge(userId);
    if (challenge.completed) {
      return challenge;
    }

    const client = dailyChallengeClient(this.prisma);
    const row = await client.update({
      where: { id: challenge.id! },
      data: {
        completed: true,
        score,
      },
    });

    return this.toEntity(row);
  }

  async getChallengeHistory(userId: string, limit = 14): Promise<DailyChallenge[]> {
    const client = dailyChallengeClient(this.prisma);
    const rows = await client.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return rows.map((row) => this.toEntity(row));
  }

  async assertUserAccess(
    requestedUserId: string,
    currentUserId: string,
  ): Promise<void> {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('Cannot access another user\'s daily challenge');
    }
  }

  private async buildChallengeForUser(userId: string): Promise<ChallengePayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [dueItems, topErrors, overview, recommendations] = await Promise.all([
      this.srsService.getDueReviews(userId, 1),
      this.errorPatternsService.getTopErrorPatterns(userId, 1),
      this.masteryService.getOverview(userId),
      this.predictionService.getRecommendations(userId),
    ]);

    const srsDue = dueItems[0]
      ? { module: dueItems[0].module, concept: dueItems[0].concept }
      : null;
    const topError = topErrors[0]
      ? {
          module: topErrors[0].module,
          concept: topErrors[0].concept,
          count: topErrors[0].count,
        }
      : null;
    const weakest = overview.weakest[0]
      ? {
          module: overview.weakest[0].module,
          concept: overview.weakest[0].concept,
          masteryScore: overview.weakest[0].masteryScore,
        }
      : null;
    const prediction = recommendations.predictions[0];

    return generateChallenge({
      userId,
      userLevel: mapPrismaLevel(user.level ?? Level.A2),
      srsDue,
      topError,
      predictionDifficulty: prediction?.predicted_difficulty ?? 2,
      weakest,
    });
  }

  private async applySubmissionEffects(
    userId: string,
    challenge: ChallengePayload,
    userAnswer: string,
    correct: boolean,
  ): Promise<void> {
    const module = challenge.type as MasteryModule;

    await this.masteryService.recordConceptActivity(userId, module, challenge.concept, {
      correct,
    });

    if (!correct) {
      await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer,
        correctAnswer: challenge.answer ?? challenge.prompt ?? challenge.question,
        module: module as ErrorPatternModule,
        concept: challenge.concept,
        topic: challenge.concept,
      });
    }

    if (challenge.source === 'srs_review') {
      await this.srsService.recordReview(userId, {
        module: challenge.type,
        concept: challenge.concept,
        rating: correct ? 'good' : 'again',
      });
    }
  }

  private toEntity(row: DailyChallengeRow): DailyChallenge {
    return {
      id: row.id,
      userId: row.userId,
      date: row.date,
      challenge: row.challenge as ChallengePayload,
      completed: row.completed,
      score: row.score ?? undefined,
    };
  }
}

function utcDayStart(dateKey = todayUtcKey()): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
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
