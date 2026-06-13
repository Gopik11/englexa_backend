import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DailyMission, Level } from '@prisma/client';
import { SimpleCacheService } from '../common/cache/simple-cache.service';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AI_EVALUATION_SERVICE,
  AiEvaluationService,
} from '../ai/interfaces/ai-evaluation.interface';

export interface TodayMissionResponse {
  mission: {
    id: string;
    type: string;
    prompt: string;
    level: string;
  };
  completedToday: boolean;
  todayCompletion?: {
    score: number;
    feedback: string;
    userAnswer: string;
  };
}

const MISSIONS_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly cache: SimpleCacheService,
    @Inject(AI_EVALUATION_SERVICE)
    private readonly evaluationService: AiEvaluationService,
  ) {}

  async getTodayMission(userId: string): Promise<TodayMissionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, level: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const mission = await this.selectMissionForToday(user.level);
    const missionDate = this.todayUtcDate();

    const completion = await this.prisma.missionCompletion.findUnique({
      where: {
        userId_missionDate: { userId, missionDate },
      },
      select: {
        score: true,
        feedback: true,
        userAnswer: true,
      },
    });

    return {
      mission: {
        id: mission.id,
        type: mission.type,
        prompt: mission.prompt,
        level: mission.level,
      },
      completedToday: Boolean(completion),
      todayCompletion: completion ?? undefined,
    };
  }

  async submitMission(userId: string, answer: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, level: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const missionDate = this.todayUtcDate();
    const existing = await this.prisma.missionCompletion.findUnique({
      where: { userId_missionDate: { userId, missionDate } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Today\'s mission already completed');
    }

    const mission = await this.selectMissionForToday(user.level);

    const evaluation = await this.evaluationService.evaluateAnswer({
      userId,
      prompt: mission.prompt,
      userAnswer: answer,
      expectedAnswer: mission.expectedAnswer ?? undefined,
    });

    const completion = await this.prisma.missionCompletion.create({
      data: {
        userId,
        missionId: mission.id,
        missionDate,
        userAnswer: answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    });

    await this.gamificationService.recordActivity(userId);
    await this.gamificationService.addXp(userId, evaluation.score);

    return {
      completion,
      evaluation,
    };
  }

  private async selectMissionForToday(level: Level): Promise<DailyMission> {
    const missions = await this.getMissionsForLevel(level);

    if (missions.length === 0) {
      const fallback = await this.getAllMissions();
      if (fallback.length === 0) {
        throw new NotFoundException('No missions configured');
      }
      const dayIndex = this.dayOfYear() % fallback.length;
      return fallback[dayIndex];
    }

    const dayIndex = this.dayOfYear() % missions.length;
    return missions[dayIndex];
  }

  private async getMissionsForLevel(level: Level): Promise<DailyMission[]> {
    const cacheKey = `missions:level:${level}`;
    const cached = this.cache.get<DailyMission[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const missions = await this.prisma.dailyMission.findMany({
      where: { level },
      orderBy: { createdAt: 'asc' },
    });

    this.cache.set(cacheKey, missions, MISSIONS_CACHE_TTL_MS);
    return missions;
  }

  private async getAllMissions(): Promise<DailyMission[]> {
    const cacheKey = 'missions:all';
    const cached = this.cache.get<DailyMission[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const missions = await this.prisma.dailyMission.findMany({
      orderBy: { createdAt: 'asc' },
    });

    this.cache.set(cacheKey, missions, MISSIONS_CACHE_TTL_MS);
    return missions;
  }

  private todayUtcDate(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private dayOfYear(): number {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
