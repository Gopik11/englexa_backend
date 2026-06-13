import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { buildReadingEnrichedFeedback } from '../content/feedback-enrichment';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { effectiveLevelForDifficulty } from '../mastery/utils/difficulty-adjuster';
import {
  ALL_READING_TOPICS,
  READING_TOPICS_BY_LEVEL,
} from '../content/reading-topics.constants';
import {
  GetReadingPassageResult,
  ReadingPassage,
  ReadingPassagePublic,
  ReadingQuestionFeedback,
  ReadingTopic,
  SubmitReadingAnswerResult,
} from './interfaces/reading-passage.interface';
import { AiReadingGenerator } from './utils/ai-reading-generator';
import {
  getOrCreateReadingTopicProgress,
  recordReadingCorrect,
  recordReadingMistake,
  recordReadingQuestionCorrect,
  recordReadingQuestionMistake,
} from './utils/reading-adaptive-logic';
import { loadReadingPassages } from './utils/content-loader';
import { evaluateVocabAnswer } from '../vocabulary-practice/utils/vocab-exercise-helpers';

export interface ReadingAnswerInput {
  questionId: string;
  userAnswer: string;
}

@Injectable()
export class ReadingPracticeService {
  private readonly logger = new Logger(ReadingPracticeService.name);
  private readonly moduleDir = __dirname;

  constructor(
    private readonly aiGenerator: AiReadingGenerator,
    private readonly gamificationService: GamificationService,
    private readonly masteryService: MasteryService,
    private readonly adaptiveService: AdaptiveService,
    private readonly errorPatternsService: ErrorPatternsService,
  ) {}

  listTopics(): ReadingTopic[] {
    return [...ALL_READING_TOPICS];
  }

  listTopicsForLevel(level: LearnerLevel): ReadingTopic[] {
    return [...READING_TOPICS_BY_LEVEL[level]];
  }

  async getPassage(
    userId: string,
    level: LearnerLevel,
    topic: ReadingTopic,
  ): Promise<GetReadingPassageResult> {
    const userProgress = getOrCreateReadingTopicProgress(userId, topic, level);

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'reading',
      topic,
    );
    const generationLevel = effectiveLevelForDifficulty(
      level,
      difficultyState.difficulty_level,
    );

    const jsonPool = loadReadingPassages(level, topic, this.moduleDir);
    const jsonRemaining = jsonPool.filter(
      (item) => !userProgress.completedPassageIds.has(item.id),
    );

    const useAi = jsonRemaining.length === 0;

    const passage = useAi
      ? this.aiGenerator.generate(
          userId,
          generationLevel,
          topic,
          userProgress.aiSequence++,
        )
      : jsonRemaining[0]!;

    if (useAi) {
      userProgress.aiServed += 1;
    }

    userProgress.totalServed += 1;

    this.logger.log(
      `user=${userId} level=${generationLevel} topic=${topic} passage=${passage.id} ai=${useAi} difficulty=${difficultyState.difficulty_level}`,
    );

    return {
      passage: toPublicPassage(passage),
      effectiveLevel: generationLevel,
      difficultyLevel: difficultyState.difficulty_level,
      hasMore: jsonRemaining.length > 1 || useAi,
      jsonRemaining: Math.max(0, jsonRemaining.length - (useAi ? 0 : 1)),
    };
  }

  async submitAnswer(
    userId: string,
    passageId: string,
    answers: ReadingAnswerInput[],
    level: LearnerLevel,
    topic: ReadingTopic,
  ): Promise<SubmitReadingAnswerResult> {
    const passage = this.resolvePassage(passageId, level, topic);
    if (!passage) {
      throw new NotFoundException('Reading passage not found');
    }

    const userProgress = getOrCreateReadingTopicProgress(userId, topic, level);
    const results: ReadingQuestionFeedback[] = [];
    const errorPatterns: NonNullable<SubmitReadingAnswerResult['error_patterns']> =
      [];

    for (const answer of answers) {
      const question = passage.questions.find(
        (item) => item.id === answer.questionId,
      );
      if (!question) {
        throw new NotFoundException(`Question ${answer.questionId} not found`);
      }

      const questionKey = `${passageId}:${answer.questionId}`;
      const { isCorrect } = evaluateVocabAnswer(answer.userAnswer, {
        correct_answer: question.correct_answer,
        alternatives: question.alternatives,
      });

      if (isCorrect) {
        recordReadingCorrect(userId, topic);
        recordReadingQuestionCorrect(userId, questionKey);
      } else {
        recordReadingMistake(userId, topic);
        recordReadingQuestionMistake(userId, questionKey);
      }

      await this.adaptiveService.recordResult(
        userId,
        'reading',
        topic,
        isCorrect,
      );

      let errorPattern: ReadingQuestionFeedback['errorPattern'] = null;
      if (!isCorrect) {
        const stored = await this.errorPatternsService.detectAndRecord(userId, {
          userAnswer: answer.userAnswer,
          correctAnswer: question.correct_answer,
          module: 'reading',
          concept: topic,
          topic,
        });
        if (stored) {
          errorPattern = {
            module: stored.module,
            concept: stored.concept,
            error_type: stored.error_type,
          };
          errorPatterns.push(errorPattern);
        }
      }

      userProgress.answeredQuestionIds.add(questionKey);

      const enriched = buildReadingEnrichedFeedback({
        userId,
        level: userProgress.effectiveLevel,
        isCorrect,
        conceptKey: topic,
        correctAnswer: question.correct_answer,
        userAnswer: answer.userAnswer,
        questionText: question.question,
        comprehensionFeedback: question.explanation,
      });

      results.push({
        questionId: answer.questionId,
        isCorrect,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        errorPattern,
        ...enriched,
      });
    }

    const questionsAnswered = passage.questions.filter((item) =>
      userProgress.answeredQuestionIds.has(`${passageId}:${item.id}`),
    ).length;

    const passageComplete = questionsAnswered >= passage.questions.length;
    if (passageComplete) {
      userProgress.completedPassageIds.add(passageId);
    }

    let xpEarned = 0;
    let streak = 0;

    const correctCount = results.filter((item) => item.isCorrect).length;
    await this.masteryService.recordConceptActivity(userId, 'reading', topic, {
      correct: correctCount >= Math.ceil(results.length / 2),
    });

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'reading',
      topic,
    );

    if (passageComplete) {
      const reward = await this.gamificationService.awardActivityXp(
        userId,
        'reading_completed',
      );
      xpEarned = reward.xpEarned;
      streak = reward.streak;
    } else {
      await this.gamificationService.recordActivity(userId);
    }

    this.logger.log(
      `user=${userId} topic=${topic} passage=${passageId} evaluated=${results.length} complete=${passageComplete}`,
    );

    return {
      results,
      passageComplete,
      xpEarned,
      streak,
      difficultyLevel: difficultyState.difficulty_level,
      error_patterns: errorPatterns,
    };
  }

  private resolvePassage(
    passageId: string,
    level: LearnerLevel,
    topic: ReadingTopic,
  ): ReadingPassage | null {
    const generated = this.aiGenerator.findById(passageId);
    if (generated) {
      return generated;
    }

    const jsonPool = loadReadingPassages(level, topic, this.moduleDir);
    return jsonPool.find((item) => item.id === passageId) ?? null;
  }
}

function toPublicPassage(passage: ReadingPassage): ReadingPassagePublic {
  return {
    id: passage.id,
    level: passage.level,
    topic: passage.topic,
    title: passage.title,
    passage: passage.passage,
    questions: passage.questions.map((question) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
    })),
  };
}
