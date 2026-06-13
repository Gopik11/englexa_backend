import { ForbiddenException, Injectable } from '@nestjs/common';
import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';
import { CachedDataService } from '../common/cache/cached-data.service';
import { AdaptiveModule } from '../adaptive/entities/difficulty.entity';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import {
  ConceptMastery,
  MasteryModule,
} from '../mastery/entities/concept-mastery.entity';
import { MasteryService } from '../mastery/mastery.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConceptPrediction,
  PredictionRecommendations,
} from './entities/prediction.entity';
import {
  adaptiveLevelToFactor,
  computePrediction,
  recentAccuracy,
  srsDueToFactor,
} from './utils/prediction-model';
import { srsLookupClient } from './utils/prisma-srs-lookup';

@Injectable()
export class PredictionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly adaptiveService: AdaptiveService,
    private readonly cachedData: CachedDataService,
  ) {}

  async predictForConcept(
    userId: string,
    module: string,
    concept: string,
  ): Promise<ConceptPrediction> {
    const overview = await this.masteryService.getOverview(userId);
    const mastery =
      overview.concepts.find(
        (item) => item.module === module && item.concept === concept,
      ) ?? this.defaultMastery(module as MasteryModule, concept);

    return this.buildPrediction(userId, mastery);
  }

  async predictForModule(
    userId: string,
    module: string,
  ): Promise<ConceptPrediction[]> {
    const overview = await this.masteryService.getOverview(userId);
    const concepts = overview.concepts.filter((item) => item.module === module);

    if (concepts.length === 0) {
      return [await this.predictForConcept(userId, module, 'articles')];
    }

    return Promise.all(
      concepts.map((item) => this.buildPrediction(userId, item)),
    );
  }

  async predictForAll(userId: string): Promise<ConceptPrediction[]> {
    const overview = await this.masteryService.getOverview(userId);
    const concepts =
      overview.concepts.length > 0
        ? overview.concepts
        : [
            this.defaultMastery('grammar', 'articles'),
            this.defaultMastery('vocabulary', 'collocations'),
          ];

    return Promise.all(
      concepts.map((item) => this.buildPrediction(userId, item)),
    );
  }

  async getRecommendations(userId: string): Promise<PredictionRecommendations> {
    return this.cachedData.getOrSet(
      CacheKeys.predictions(userId),
      CacheTtl.fifteenMinutes,
      () => this.buildRecommendations(userId),
    );
  }

  private async buildRecommendations(
    userId: string,
  ): Promise<PredictionRecommendations> {
    const predictions = await this.predictForAll(userId);

    const ranked = [...predictions].sort((a, b) => {
      const priority = (item: ConceptPrediction) => {
        let score = item.probability_correct;
        if (item.needs_review) score -= 0.3;
        if (item.needs_mini_lesson) score -= 0.2;
        if (item.recommended_action === 'review') score -= 0.15;
        return score;
      };
      return priority(a) - priority(b);
    });

    return {
      userId,
      predictions: ranked.slice(0, 8),
      generated_at: new Date(),
    };
  }

  async assertUserAccess(requestedUserId: string, currentUserId: string): Promise<void> {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('Cannot access another user\'s predictions');
    }
  }

  private async buildPrediction(
    userId: string,
    mastery: ConceptMastery,
  ): Promise<ConceptPrediction> {
    const module = mastery.module;
    const concept = mastery.concept;

    const [adaptive, errorPatterns, srsRow] = await Promise.all([
      this.adaptiveService.getDifficulty(
        userId,
        module as AdaptiveModule,
        concept,
      ),
      this.errorPatternsService.getTopErrorPatterns(userId, 20),
      srsLookupClient(this.prisma).findUnique({
        where: {
          userId_module_concept: { userId, module, concept },
        },
      }),
    ]);

    const pattern = errorPatterns.find(
      (item) => item.module === module && item.concept === concept,
    );
    const errorCount = pattern?.count ?? 0;

    const now = new Date();
    const srsOverdue = srsRow ? srsRow.nextReviewAt <= now : false;
    const daysOverdue = srsRow
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - srsRow.nextReviewAt.getTime()) /
              (24 * 60 * 60 * 1000),
          ),
        )
      : 0;

    const output = computePrediction({
      mastery_score: mastery.masteryScore,
      recent_accuracy: recentAccuracy(adaptive.correct, adaptive.attempts),
      srs_factor: srsDueToFactor(srsOverdue, daysOverdue),
      adaptive_difficulty_factor: adaptiveLevelToFactor(
        adaptive.difficulty_level,
      ),
      error_pattern_count: errorCount,
      srs_overdue: srsOverdue,
    });

    return {
      userId,
      module,
      concept,
      predicted_difficulty: output.predicted_difficulty,
      probability_correct: output.probability_correct,
      needs_review: output.needs_review,
      needs_mini_lesson: output.needs_mini_lesson,
      recommended_action: output.recommended_action,
      timestamp: new Date(),
    };
  }

  private defaultMastery(module: MasteryModule, concept: string): ConceptMastery {
    return {
      module,
      concept,
      correctCount: 0,
      mistakeCount: 0,
      masteryScore: 0,
      band: 'weak',
      timeSpentMs: 0,
      difficulty: 1,
    };
  }
}
