import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Level } from '@prisma/client';

import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';

import { CachedDataService } from '../common/cache/cached-data.service';

import { SimpleCacheService } from '../common/cache/simple-cache.service';

import { LearnerLevel } from '../content/englexa-content-spec.constants';

import { DailyChallengeService } from '../daily-challenge/daily-challenge.service';

import { DailyChallenge } from '../daily-challenge/entities/daily-challenge.entity';

import { GamificationService } from '../gamification/gamification.service';

import { MiniLessonsService } from '../mini-lessons/mini-lessons.service';

import { MiniLesson } from '../mini-lessons/entities/mini-lesson.entity';

import { PredictionService } from '../prediction/prediction.service';

import { ConceptPrediction } from '../prediction/entities/prediction.entity';

import { PrismaService } from '../prisma/prisma.service';

import { SrsDueItem } from '../srs/entities/srs.entity';

import { SrsService } from '../srs/srs.service';

import { msUntilUtcMidnight, todayUtcKey } from './utils/daily-seed';

import { generateMiniCrossword, MiniCrossword } from './utils/crossword-generator';

import {

  HomeDataResponse,

  ShapedDailyChallenge,

  ShapedMiniLesson,

  ShapedPrediction,

  ShapedSrsDueItem,

  emptyHomeData,

} from './dto/home-data.dto';

import { generatePuzzleOfTheDay, PuzzleOfTheDay } from './utils/puzzle-generator';

import { generateQuoteOfTheDay, QuoteOfTheDay } from './utils/quote-generator';

import { generateWordOfTheDay, WordOfTheDay } from './utils/word-generator';



@Injectable()

export class HomeService {

  private readonly logger = new Logger(HomeService.name);

  constructor(

    private readonly prisma: PrismaService,

    private readonly cache: SimpleCacheService,

    private readonly cachedData: CachedDataService,

    private readonly miniLessonsService: MiniLessonsService,

    private readonly srsService: SrsService,

    private readonly predictionService: PredictionService,

    private readonly dailyChallengeService: DailyChallengeService,

    private readonly gamificationService: GamificationService,

  ) {}



  async getHomeData(userId: string): Promise<HomeDataResponse> {
    try {
      return await this.cachedData.getOrSet(
        CacheKeys.homeData(userId),
        CacheTtl.untilMidnight(),
        () => this.buildHomeData(userId),
      );
    } catch (error) {
      this.logger.error(`home-data failed user=${userId}`, error);
      return emptyHomeData();
    }
  }

  private async buildHomeData(userId: string): Promise<HomeDataResponse> {
    const [
      word,
      dailyChallenge,
      miniLesson,
      srsDue,
      predictions,
      gamification,
    ] = await Promise.all([
      this.getWordOfTheDay(userId).catch(() => ({
        word: '',
        meaning: '',
        example: '',
        level: 'beginner' as LearnerLevel,
      })),
      this.getDailyChallenge(userId).catch(() => null),
      this.getFeaturedMiniLesson(userId).catch(() => null),
      this.getSrsDueReviews(userId).catch(() => [] as SrsDueItem[]),
      this.getPredictionRecommendations(userId).catch(
        () => [] as ConceptPrediction[],
      ),
      this.gamificationService.getStatus(userId).catch(() => ({
        xp: 0,
        level: 1,
        streak: 0,
        xpToNextLevel: 200,
      })),
    ]);

    return {
      word_of_the_day: {
        word: word.word ?? '',
        definition: word.meaning ?? '',
        example: word.example ?? '',
      },
      daily_challenge: shapeDailyChallenge(dailyChallenge),
      mini_lesson: shapeMiniLesson(miniLesson),
      srs_due: shapeSrsItems(srsDue ?? []),
      predictions: shapePredictions(predictions ?? []),
      gamification: {
        xp: gamification.xp ?? 0,
        level: gamification.level ?? 1,
        streak: gamification.streak ?? 0,
        xp_to_next_level: gamification.xpToNextLevel ?? 200,
      },
    };
  }



  async getWordOfTheDay(userId: string): Promise<WordOfTheDay> {

    const level = await this.loadUserLevel(userId);

    return this.getOrGenerate(userId, 'word', () =>

      generateWordOfTheDay(level, userId),

    );

  }



  async getQuoteOfTheDay(userId: string): Promise<QuoteOfTheDay> {

    return this.getOrGenerate(userId, 'quote', () =>

      generateQuoteOfTheDay(userId),

    );

  }



  async getPuzzleOfTheDay(userId: string): Promise<PuzzleOfTheDay> {

    const level = await this.loadUserLevel(userId);

    return this.getOrGenerate(userId, 'puzzle', () =>

      generatePuzzleOfTheDay(level, userId),

    );

  }



  async getCrossword(userId: string): Promise<MiniCrossword> {

    const level = await this.loadUserLevel(userId);

    return this.getOrGenerate(userId, 'crossword', () =>

      generateMiniCrossword(level, userId),

    );

  }



  async getFeaturedMiniLesson(userId: string): Promise<MiniLesson> {

    return this.cachedData.getOrSet(

      CacheKeys.miniLessonFeatured(userId),

      CacheTtl.oneHour,

      () => this.miniLessonsService.getFeaturedLesson(userId),

    );

  }



  async getSrsDueReviews(userId: string): Promise<SrsDueItem[]> {

    return this.cachedData.getOrSet(

      CacheKeys.srsDue(userId),

      CacheTtl.fiveMinutes,

      () => this.srsService.getDueReviews(userId, 5),

    );

  }



  async getPredictionRecommendations(

    userId: string,

  ): Promise<ConceptPrediction[]> {

    return this.cachedData.getOrSet(

      CacheKeys.predictions(userId),

      CacheTtl.fifteenMinutes,

      async () => {

        const result = await this.predictionService.getRecommendations(userId);

        return result.predictions.slice(0, 3);

      },

    );

  }



  async getDailyChallenge(userId: string): Promise<DailyChallenge> {

    return this.cachedData.getOrSet(

      CacheKeys.dailyChallenge(userId),

      CacheTtl.untilMidnight(),

      () => this.dailyChallengeService.getTodayChallenge(userId),

    );

  }



  private async getOrGenerate<T>(

    userId: string,

    feature: string,

    factory: () => T,

  ): Promise<T> {

    const dateKey = todayUtcKey();

    const cacheKey = `home:${userId}:${feature}:${dateKey}`;

    const cached = this.cache.get<T>(cacheKey);

    if (cached) {

      return cached;

    }



    const value = factory();

    this.cache.set(cacheKey, value, msUntilUtcMidnight());

    return value;

  }



  private async loadUserLevel(userId: string): Promise<LearnerLevel> {

    const user = await this.prisma.user.findUnique({

      where: { id: userId },

      select: { level: true },

    });

    if (!user) {

      throw new NotFoundException('User not found');

    }

    return mapPrismaLevel(user.level ?? Level.A2);

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



function shapeDailyChallenge(

  challenge: DailyChallenge | null,

): ShapedDailyChallenge | null {

  if (!challenge) return null;



  return {

    completed: challenge.completed,

    score: challenge.score,

    type: challenge.challenge.type,

    concept: challenge.challenge.concept,

    difficulty: challenge.challenge.difficulty,

    question: challenge.challenge.question,

    prompt: challenge.challenge.prompt,

  };

}



function shapeMiniLesson(lesson: MiniLesson | null): ShapedMiniLesson | null {

  if (!lesson) return null;



  return {

    id: lesson.id,

    concept: lesson.concept,

    module: lesson.module,

    title: lesson.title,

    difficulty_level: lesson.difficulty_level,

    estimated_time: lesson.estimated_time,

  };

}



function shapeSrsItems(items: SrsDueItem[]): ShapedSrsDueItem[] {

  return items.map((item) => ({

    module: item.module,

    concept: item.concept,

    title: item.content?.title ?? item.concept,

  }));

}



function shapePredictions(items: ConceptPrediction[]): ShapedPrediction[] {

  return items.map((item) => ({

    module: item.module,

    concept: item.concept,

    predicted_difficulty: item.predicted_difficulty,

    probability_correct: item.probability_correct,

    recommended_action: item.recommended_action,

  }));

}


