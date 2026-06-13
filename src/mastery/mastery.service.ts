import { Injectable, NotFoundException } from '@nestjs/common';
import { Level } from '@prisma/client';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConceptMastery,
  MasteryModule,
  MasteryOverview,
  MasteryRecommendation,
} from './entities/concept-mastery.entity';
import { nextDifficulty } from './utils/difficulty-adjuster';
import {
  computeMasteryScore,
  compareStrongest,
  compareWeakest,
  masteryBand,
} from './utils/mastery-rules';
import { buildRecommendation } from './utils/recommendation-engine';

const DEFAULT_CONCEPTS: Record<MasteryModule, string[]> = {
  grammar: [
    'articles',
    'tenses',
    'prepositions',
    'subject_verb_agreement',
    'modals',
  ],
  vocabulary: [
    'word_families',
    'collocations',
    'synonyms',
    'antonyms',
    'context_clues',
  ],
  reading: ['inference', 'detail', 'vocabulary_in_context'],
  speaking: ['pronunciation_patterns', 'fluency_patterns'],
  writing: ['grammar_patterns', 'coherence', 'structure'],
};

@Injectable()
export class MasteryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorPatternsService: ErrorPatternsService,
  ) {}

  async recordConceptActivity(
    userId: string,
    module: MasteryModule,
    concept: string,
    options: { correct: boolean; timeSpentMs?: number },
  ): Promise<ConceptMastery> {
    if (module === 'grammar') {
      return this.recordGrammarConcept(userId, concept, options);
    }

    const existing = await this.prisma.skillConceptMastery.findUnique({
      where: {
        userId_module_concept: { userId, module, concept },
      },
    });

    const correctCount =
      (existing?.correctCount ?? 0) + (options.correct ? 1 : 0);
    const mistakeCount =
      (existing?.mistakeCount ?? 0) + (options.correct ? 0 : 1);
    const masteryScore = computeMasteryScore(correctCount, mistakeCount);
    const difficulty = nextDifficulty(
      masteryScore,
      existing?.difficulty ?? 1,
    );
    const timeSpentMs =
      (existing?.timeSpentMs ?? 0) + (options.timeSpentMs ?? 0);

    const row = await this.prisma.skillConceptMastery.upsert({
      where: {
        userId_module_concept: { userId, module, concept },
      },
      create: {
        userId,
        module,
        concept,
        correctCount,
        mistakeCount,
        masteryScore,
        timeSpentMs,
        difficulty,
      },
      update: {
        correctCount,
        mistakeCount,
        masteryScore,
        timeSpentMs,
        difficulty,
      },
    });

    return this.toConceptMastery(row);
  }

  async getOverview(userId: string): Promise<MasteryOverview> {
    const concepts = await this.loadAllConcepts(userId);
    const weakest = [...concepts].sort(compareWeakest).slice(0, 5);
    const strongest = [...concepts].sort(compareStrongest).slice(0, 5);

    return { concepts, weakest, strongest };
  }

  async getRecommendation(userId: string): Promise<MasteryRecommendation> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [overview, topPatterns] = await Promise.all([
      this.getOverview(userId),
      this.errorPatternsService.getTopErrorPatterns(userId, 3),
    ]);

    const recommendation = buildRecommendation(
      overview.concepts,
      mapPrismaLevel(user.level ?? Level.A2),
    );

    const leadingPattern = topPatterns[0];
    if (leadingPattern) {
      recommendation.reason = `${recommendation.reason} Focus on your recurring ${leadingPattern.error_type.replace(/_/g, ' ')} pattern in ${leadingPattern.concept.replace(/_/g, ' ')}.`;
    }

    return recommendation;
  }

  private async recordGrammarConcept(
    userId: string,
    concept: string,
    options: { correct: boolean; timeSpentMs?: number },
  ): Promise<ConceptMastery> {
    const existing = await this.prisma.grammarConceptProgress.findUnique({
      where: { userId_concept: { userId, concept } },
    });

    const correctCount =
      (existing?.correctCount ?? 0) + (options.correct ? 1 : 0);
    const mistakeCount =
      (existing?.mistakeCount ?? 0) + (options.correct ? 0 : 1);
    const masteryScore = computeMasteryScore(correctCount, mistakeCount);

    const row = await this.prisma.grammarConceptProgress.upsert({
      where: { userId_concept: { userId, concept } },
      create: {
        userId,
        concept,
        correctCount,
        mistakeCount,
        masteryScore,
      },
      update: {
        correctCount,
        mistakeCount,
        masteryScore,
      },
    });

    return {
      module: 'grammar',
      concept: row.concept,
      correctCount: row.correctCount,
      mistakeCount: row.mistakeCount,
      masteryScore: row.masteryScore,
      band: masteryBand(row.masteryScore),
      timeSpentMs: options.timeSpentMs ?? 0,
      difficulty: nextDifficulty(row.masteryScore, 1),
    };
  }

  private async loadAllConcepts(userId: string): Promise<ConceptMastery[]> {
    const [grammarRows, skillRows] = await Promise.all([
      this.prisma.grammarConceptProgress.findMany({ where: { userId } }),
      this.prisma.skillConceptMastery.findMany({ where: { userId } }),
    ]);

    const concepts: ConceptMastery[] = [
      ...grammarRows.map((row) => ({
        module: 'grammar' as MasteryModule,
        concept: row.concept,
        correctCount: row.correctCount,
        mistakeCount: row.mistakeCount,
        masteryScore: row.masteryScore,
        band: masteryBand(row.masteryScore),
        timeSpentMs: 0,
        difficulty: nextDifficulty(row.masteryScore, 1),
      })),
      ...skillRows.map((row) => this.toConceptMastery(row)),
    ];

    const existingKeys = new Set(
      concepts.map((item) => `${item.module}:${item.concept}`),
    );

    for (const [module, conceptList] of Object.entries(DEFAULT_CONCEPTS) as [
      MasteryModule,
      string[],
    ][]) {
      for (const concept of conceptList) {
        const key = `${module}:${concept}`;
        if (!existingKeys.has(key)) {
          concepts.push({
            module,
            concept,
            correctCount: 0,
            mistakeCount: 0,
            masteryScore: 0,
            band: 'weak',
            timeSpentMs: 0,
            difficulty: 1,
          });
        }
      }
    }

    return concepts;
  }

  private toConceptMastery(row: {
    module: string;
    concept: string;
    correctCount: number;
    mistakeCount: number;
    masteryScore: number;
    timeSpentMs: number;
    difficulty: number;
  }): ConceptMastery {
    return {
      module: row.module as MasteryModule,
      concept: row.concept,
      correctCount: row.correctCount,
      mistakeCount: row.mistakeCount,
      masteryScore: row.masteryScore,
      band: masteryBand(row.masteryScore),
      timeSpentMs: row.timeSpentMs,
      difficulty: row.difficulty,
    };
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
