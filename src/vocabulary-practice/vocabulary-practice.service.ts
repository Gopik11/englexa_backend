import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { buildVocabEnrichedFeedback } from '../content/feedback-enrichment';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { effectiveLevelForDifficulty } from '../mastery/utils/difficulty-adjuster';
import { ALL_VOCAB_TOPICS, VOCAB_TOPICS_BY_LEVEL } from '../content/vocabulary-topics.constants';
import {
  GetVocabExercisesResult,
  SubmitVocabAnswerResult,
  VocabExercise,
  VocabExercisePublic,
  VocabTopic,
} from './interfaces/vocab-exercise.interface';
import { AiVocabGenerator } from './utils/ai-vocab-generator';
import {
  getOrCreateVocabTopicProgress,
  getVocabWordMistakeCount,
  getWeakestWordForTopic,
  recordVocabTopicCorrect,
  recordVocabTopicMistake,
  recordVocabWordCorrect,
  recordVocabWordMistake,
  shouldGenerateAIVocabExercise,
  VOCAB_BATCH_SIZE,
  VOCAB_MISTAKE_THRESHOLD,
  VocabTopicProgress,
} from './utils/vocab-adaptive-logic';
import { loadVocabExercises } from './utils/content-loader';
import {
  evaluateVocabAnswer,
  extractWordKey,
  toPublicVocabExercise,
} from './utils/vocab-exercise-helpers';
import { generateVocabMicroLesson } from './utils/vocab-micro-lesson';

@Injectable()
export class VocabularyPracticeService {
  private readonly logger = new Logger(VocabularyPracticeService.name);
  private readonly moduleDir = __dirname;

  constructor(
    private readonly aiGenerator: AiVocabGenerator,
    private readonly gamificationService: GamificationService,
    private readonly masteryService: MasteryService,
    private readonly adaptiveService: AdaptiveService,
    private readonly errorPatternsService: ErrorPatternsService,
  ) {}

  listTopics(): VocabTopic[] {
    return [...ALL_VOCAB_TOPICS];
  }

  listTopicsForLevel(level: LearnerLevel): VocabTopic[] {
    return [...VOCAB_TOPICS_BY_LEVEL[level]];
  }

  async getExercises(
    userId: string,
    level: LearnerLevel,
    topic: VocabTopic,
  ): Promise<GetVocabExercisesResult> {
    const userProgress = getOrCreateVocabTopicProgress(userId, topic, level);
    userProgress.targetWord = getWeakestWordForTopic(userId, topic);

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'vocabulary',
      topic,
    );
    const generationLevel = effectiveLevelForDifficulty(
      level,
      difficultyState.difficulty_level,
    );

    const jsonPool = loadVocabExercises(level, topic, this.moduleDir);
    const jsonRemaining = jsonPool.filter(
      (item) => !userProgress.completedIds.has(item.id),
    );

    const useAi =
      jsonRemaining.length === 0 || shouldGenerateAIVocabExercise(userId, topic);

    let batch: VocabExercise[];

    if (!useAi) {
      batch = jsonRemaining.slice(0, VOCAB_BATCH_SIZE);
    } else if (jsonRemaining.length > 0) {
      const jsonCount = Math.min(VOCAB_BATCH_SIZE - 1, jsonRemaining.length);
      batch = [
        ...jsonRemaining.slice(0, jsonCount),
        ...this.buildAiBatch(
          userId,
          topic,
          userProgress,
          VOCAB_BATCH_SIZE - jsonCount,
          generationLevel,
        ),
      ];
    } else {
      batch = this.buildAiBatch(
        userId,
        topic,
        userProgress,
        VOCAB_BATCH_SIZE,
        generationLevel,
      );
    }

    userProgress.totalServed += batch.length;

    this.logger.log(
      `user=${userId} level=${generationLevel} topic=${topic} batch=${batch.length} ai=${useAi} targetWord=${userProgress.targetWord ?? 'none'} difficulty=${difficultyState.difficulty_level}`,
    );

    const jsonInBatch = batch.filter((item) => !item.id.startsWith('ai_')).length;
    const remainingAfterBatch = Math.max(0, jsonRemaining.length - jsonInBatch);

    return {
      exercises: batch.map((item) => toPublicVocabExercise(item)),
      effectiveLevel: generationLevel,
      difficultyLevel: difficultyState.difficulty_level,
      hasMore: remainingAfterBatch > 0 || jsonRemaining.length === 0,
      jsonRemaining: remainingAfterBatch,
    };
  }

  async submitAnswer(
    userId: string,
    exerciseId: string,
    userAnswer: string,
    level: LearnerLevel,
    topic: VocabTopic,
  ): Promise<SubmitVocabAnswerResult> {
    const exercise = this.resolveExercise(exerciseId, level, topic);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    getOrCreateVocabTopicProgress(userId, topic, level);

    const wordKey = extractWordKey(exercise);
    const { isCorrect } = evaluateVocabAnswer(userAnswer, exercise);

    if (isCorrect) {
      recordVocabTopicCorrect(userId, topic);
      recordVocabWordCorrect(userId, wordKey);
    } else {
      recordVocabTopicMistake(userId, topic);
      recordVocabWordMistake(userId, wordKey);
    }

    const userProgress = getOrCreateVocabTopicProgress(userId, topic, level);
    userProgress.completedIds.add(exerciseId);
    userProgress.targetWord = getWeakestWordForTopic(userId, topic);

    const encouragement = '';

    const attachMicroLesson =
      !isCorrect &&
      (getVocabWordMistakeCount(userId, wordKey) >= VOCAB_MISTAKE_THRESHOLD ||
        userProgress.mistakeCount >= VOCAB_MISTAKE_THRESHOLD);

    const microLesson = attachMicroLesson
      ? generateVocabMicroLesson(wordKey, topic, exercise)
      : null;

    if (microLesson) {
      this.logger.log(
        `user=${userId} word=${wordKey} repeated_mistakes micro_lesson attached`,
      );
    }

    this.logger.log(
      `user=${userId} topic=${topic} word=${wordKey} correct=${isCorrect} topicMistakes=${userProgress.mistakeCount}`,
    );

    const enriched = buildVocabEnrichedFeedback({
      userId,
      level: userProgress.effectiveLevel,
      isCorrect,
      conceptKey: topic,
      correctAnswer: exercise.correct_answer,
      userAnswer,
      word: wordKey,
      meaning: exercise.explanation,
      exampleSentence: exercise.example_sentence,
      microLesson: microLesson,
      grammarFeedback: isCorrect ? undefined : exercise.explanation,
    });

    let xpEarned = 0;
    let streak = 0;

    if (isCorrect) {
      const reward = await this.gamificationService.awardActivityXp(
        userId,
        'vocabulary_correct',
      );
      xpEarned = reward.xpEarned;
      streak = reward.streak;
    } else {
      await this.gamificationService.recordActivity(userId);
    }

    await this.masteryService.recordConceptActivity(userId, 'vocabulary', topic, {
      correct: isCorrect,
    });

    const difficultyState = await this.adaptiveService.recordResult(
      userId,
      'vocabulary',
      topic,
      isCorrect,
    );

    let errorPattern: SubmitVocabAnswerResult['errorPattern'] = null;
    if (!isCorrect) {
      const stored = await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer,
        correctAnswer: exercise.correct_answer,
        module: 'vocabulary',
        concept: wordKey,
        topic,
      });
      if (stored) {
        errorPattern = {
          module: stored.module,
          concept: stored.concept,
          error_type: stored.error_type,
        };
      }
    }

    return {
      isCorrect,
      correctAnswer: exercise.correct_answer,
      explanation: exercise.explanation,
      exampleSentence: exercise.example_sentence,
      microLesson,
      xpEarned,
      streak,
      difficultyLevel: difficultyState.difficulty_level,
      errorPattern,
      ...enriched,
    };
  }

  generateAIVocabExercise(
    userId: string,
    level: LearnerLevel,
    topic: VocabTopic,
  ): VocabExercisePublic {
    const userProgress = getOrCreateVocabTopicProgress(userId, topic, level);
    userProgress.targetWord = getWeakestWordForTopic(userId, topic);

    const exercise = this.aiGenerator.generate(
      userId,
      userProgress.effectiveLevel,
      topic,
      userProgress.aiSequence,
      userProgress.targetWord,
    );

    userProgress.aiSequence += 1;
    userProgress.totalServed += 1;
    userProgress.aiServed += 1;

    return toPublicVocabExercise(exercise);
  }

  private buildAiBatch(
    userId: string,
    topic: VocabTopic,
    userProgress: VocabTopicProgress,
    count: number,
    generationLevel: LearnerLevel,
  ): VocabExercise[] {
    const batch: VocabExercise[] = [];

    for (let i = 0; i < count; i += 1) {
      batch.push(
        this.aiGenerator.generate(
          userId,
          generationLevel,
          topic,
          userProgress.aiSequence,
          userProgress.targetWord,
        ),
      );
      userProgress.aiSequence += 1;
      userProgress.aiServed += 1;
    }

    return batch;
  }

  private resolveExercise(
    exerciseId: string,
    level: LearnerLevel,
    topic: VocabTopic,
  ): VocabExercise | null {
    const generated = this.aiGenerator.findById(exerciseId);
    if (generated) {
      return generated;
    }

    const jsonPool = loadVocabExercises(level, topic, this.moduleDir);
    return jsonPool.find((item) => item.id === exerciseId) ?? null;
  }
}
