import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';
import { CachedDataService } from '../common/cache/cached-data.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { MiniLessonsService } from '../mini-lessons/mini-lessons.service';
import { SrsService } from '../srs/srs.service';
import { PredictionService } from '../prediction/prediction.service';
import { DailyChallengeService } from '../daily-challenge/daily-challenge.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsDashboard } from './interfaces/analytics-dashboard.interface';
import { generateHeatmap } from './utils/heatmap-generator';
import {
  conceptMasteryMap,
  grammarAccuracy,
  moduleAverageMastery,
  recentMistakeConcepts,
  vocabularyRetention,
  weakConcepts,
} from './utils/progress-aggregator';
import { calculateTrend } from './utils/trend-calculator';
import { dailyActivityClient } from './utils/prisma-daily-activity';
import {
  buildLast7DaySeries,
  buildPrior7DaySeries,
  startOfUtcDay,
} from './utils/time-series-generator';

@Injectable()
export class LearnerDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly miniLessonsService: MiniLessonsService,
    private readonly srsService: SrsService,
    private readonly predictionService: PredictionService,
    private readonly dailyChallengeService: DailyChallengeService,
    private readonly cachedData: CachedDataService,
  ) {}

  async getDashboard(userId: string): Promise<AnalyticsDashboard> {
    return this.cachedData.getOrSet(
      CacheKeys.analyticsDashboard(userId),
      CacheTtl.fifteenMinutes,
      () => this.buildDashboard(userId),
    );
  }

  private async buildDashboard(userId: string): Promise<AnalyticsDashboard> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 34);

    const [
      gamification,
      grammarRows,
      skillRows,
      practiceStats,
      dailyRows,
      masteryOverview,
      topErrorPatterns,
      recommendedMiniLessons,
      srsStatus,
      predictionRecommendations,
      dailyChallenge,
    ] = await Promise.all([
      this.gamificationService.getStatus(userId),
      this.prisma.grammarConceptProgress.findMany({ where: { userId } }),
      this.prisma.skillConceptMastery.findMany({ where: { userId } }),
      this.prisma.userPracticeStats.findUnique({ where: { userId } }),
      dailyActivityClient(this.prisma).findMany({
        where: { userId, activityDate: { gte: since } },
        orderBy: { activityDate: 'asc' },
      }),
      this.masteryService.getOverview(userId),
      this.errorPatternsService.getTopErrorPatterns(userId, 8),
      this.miniLessonsService.getLessonsForWeakAreas(userId),
      this.srsService.getSrsStatus(userId),
      this.predictionService.getRecommendations(userId),
      this.dailyChallengeService.getTodayChallenge(userId),
    ]);

    const activityRows = dailyRows.map((row) => ({
      activityDate: row.activityDate,
      activityCount: row.activityCount,
      minutesSpent: row.minutesSpent,
      modulesUsed: row.modulesUsed,
    }));

    const recent7 = buildLast7DaySeries(activityRows);
    const prior7 = buildPrior7DaySeries(activityRows);
    const activityTrend = calculateTrend(recent7, prior7);

    const grammarTrend = calculateTrend(
      buildLast7DaySeries(activityRows, (row) =>
        row.modulesUsed?.includes('grammar') ? row.activityCount : 0,
      ),
      buildPrior7DaySeries(activityRows, (row) =>
        row.modulesUsed?.includes('grammar') ? row.activityCount : 0,
      ),
    );

    const vocabTrend = calculateTrend(
      buildLast7DaySeries(activityRows, (row) =>
        row.modulesUsed?.includes('vocabulary') ? row.activityCount : 0,
      ),
      buildPrior7DaySeries(activityRows, (row) =>
        row.modulesUsed?.includes('vocabulary') ? row.activityCount : 0,
      ),
    );

    const weekStart = startOfUtcDay(new Date());
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);

    const weekRows = dailyRows.filter(
      (row) => row.activityDate >= weekStart,
    );
    const modulesUsed = [
      ...new Set(weekRows.flatMap((row) => row.modulesUsed ?? [])),
    ] as string[];
    const daysActive = weekRows.filter((row) => row.activityCount > 0).length;
    const minutesSpent = weekRows.reduce(
      (sum, row) => sum + row.minutesSpent,
      0,
    );

    const readingAccuracy = moduleAverageMastery(skillRows, 'reading', 0);
    const speakingAvg = moduleAverageMastery(skillRows, 'speaking', 70);
    const writingGrammar = moduleAverageMastery(
      skillRows,
      'writing',
      65,
    );

    const recommendations = masteryOverview.weakest.slice(0, 3).map((item) => ({
      module: item.module,
      concept: item.concept,
      reason:
        item.masteryScore === 0
          ? `You have not practised ${item.concept.replace(/_/g, ' ')} yet.`
          : `${item.concept.replace(/_/g, ' ')} is at ${item.masteryScore}% — a smart focus this week.`,
    }));

    if (recommendations.length === 0) {
      recommendations.push({
        module: 'grammar',
        concept: 'articles',
        reason: 'Start with articles to build a strong grammar foundation.',
      });
    }

    return {
      xp: gamification.xp,
      level: gamification.level,
      streak: gamification.streak,
      grammar: {
        accuracy: grammarAccuracy(grammarRows),
        concept_mastery: conceptMasteryMap(grammarRows),
        recent_mistakes: recentMistakeConcepts(grammarRows),
        trend: grammarTrend || activityTrend,
      },
      vocabulary: {
        words_learned: practiceStats?.vocabularyCorrect ?? 0,
        retention_rate: vocabularyRetention(skillRows, practiceStats),
        weak_words: weakConcepts(skillRows, 'vocabulary'),
        trend: vocabTrend || activityTrend,
      },
      reading: {
        passages_completed: practiceStats?.readingCompleted ?? 0,
        comprehension_accuracy: readingAccuracy,
        trend: activityTrend,
      },
      speaking: {
        pronunciation_score: Math.min(100, speakingAvg + 5),
        fluency_score: Math.max(0, speakingAvg - 3),
        trend: activityTrend,
      },
      writing: {
        grammar_score: writingGrammar,
        coherence_score: Math.min(100, writingGrammar + 4),
        structure_score: Math.max(0, writingGrammar - 2),
        trend: activityTrend,
      },
      weekly_activity: {
        days_active: daysActive,
        minutes_spent: minutesSpent,
        modules_used: modulesUsed,
      },
      heatmap: generateHeatmap(activityRows),
      recommendations,
      weakest_concepts: masteryOverview.weakest.slice(0, 5).map((item) => ({
        module: item.module,
        concept: item.concept,
        mastery_score: item.masteryScore,
      })),
      strongest_concepts: masteryOverview.strongest.slice(0, 5).map((item) => ({
        module: item.module,
        concept: item.concept,
        mastery_score: item.masteryScore,
      })),
      trends: {
        grammar: buildLast7DaySeries(activityRows).map((item) => item.value),
        vocabulary: buildLast7DaySeries(activityRows, (row) =>
          row.modulesUsed?.includes('vocabulary') ? row.activityCount : 0,
        ).map((item) => item.value),
        reading: buildLast7DaySeries(activityRows, (row) =>
          row.modulesUsed?.includes('reading') ? row.activityCount : 0,
        ).map((item) => item.value),
        speaking: buildLast7DaySeries(activityRows, (row) =>
          row.modulesUsed?.includes('speaking') ? row.activityCount : 0,
        ).map((item) => item.value),
        writing: buildLast7DaySeries(activityRows, (row) =>
          row.modulesUsed?.includes('writing') ? row.activityCount : 0,
        ).map((item) => item.value),
      },
      top_error_patterns: topErrorPatterns.map((item) => ({
        module: item.module,
        concept: item.concept,
        error_type: item.error_type,
        count: item.count,
        last_seen: item.last_seen.toISOString(),
        examples: item.examples,
      })),
      daily_challenge: {
        date: dailyChallenge.date.toISOString(),
        completed: dailyChallenge.completed,
        score: dailyChallenge.score,
        challenge: {
          type: dailyChallenge.challenge.type,
          concept: dailyChallenge.challenge.concept,
          difficulty: dailyChallenge.challenge.difficulty,
          question: dailyChallenge.challenge.question,
          options: dailyChallenge.challenge.options,
          prompt: dailyChallenge.challenge.prompt,
          source: dailyChallenge.challenge.source,
        },
      },
      recommended_mini_lessons: recommendedMiniLessons.slice(0, 3),
      srs_status: {
        total_items: srsStatus.total_items,
        due_count: srsStatus.due_count,
        reviewed_today: srsStatus.reviewed_today,
        upcoming_count: srsStatus.upcoming_count,
      },
      prediction_recommendations: predictionRecommendations.predictions
        .slice(0, 5)
        .map((item) => ({
          module: item.module,
          concept: item.concept,
          predicted_difficulty: item.predicted_difficulty,
          probability_correct: item.probability_correct,
          needs_review: item.needs_review,
          needs_mini_lesson: item.needs_mini_lesson,
          recommended_action: item.recommended_action,
          timestamp: item.timestamp.toISOString(),
        })),
    };
  }
}
