import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { TutorFeedbackService } from '../ai/tutor-feedback.service';

import { TutorFeedbackJson } from '../ai/interfaces/tutor-feedback.interface';

import { buildEnrichedFeedback } from '../content/feedback-enrichment';

import { LearnerLevel } from '../content/englexa-content-spec.constants';

import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { GamificationService } from '../gamification/gamification.service';

import { GRAMMAR_ANSWER_XP } from '../gamification/constants/grammar-gamification.constants';

import { effectiveLevelForDifficulty } from '../mastery/utils/difficulty-adjuster';

import { ProgressService } from '../progress/progress.service';

import { GrammarProgressUpdate } from '../progress/interfaces/grammar-concept-progress.interface';

import { ALL_GRAMMAR_TOPICS, GRAMMAR_TOPICS_BY_LEVEL } from '../content/grammar-topics.constants';

import {

  GetExercisesResult,

  GrammarExercise,

  GrammarExercisePublic,

  GrammarTopic,

  SubmitAnswerResult,

} from './interfaces/grammar-exercise.interface';

import { AiExerciseGenerator } from './utils/ai-exercise-generator';

import {

  BATCH_SIZE,

  getOrCreateTopicProgress,

  getWeakestConceptForTopic,

  recordConceptCorrect,

  recordConceptMistake,

  recordCorrect,

  recordMistake,

  shouldGenerateAIExercise,

  shouldShowMicroLesson,

  TopicProgress,

} from './utils/adaptive-logic';

import { identifyConcept } from './utils/concept-detector';

import { loadGrammarExercises } from './utils/content-loader';

import {

  buildTutorInputSentence,

  evaluateExerciseAnswer,

  toPublicExercise,

} from './utils/exercise-helpers';

import { buildGrammarFeedback } from './utils/grammar-feedback-builder';

import {

  formatMicroLessonForResponse,

  generateMicroLesson,

} from './utils/micro-lesson-generator';



@Injectable()

export class GrammarPracticeService {

  private readonly logger = new Logger(GrammarPracticeService.name);

  private readonly moduleDir = __dirname;



  constructor(

    private readonly aiGenerator: AiExerciseGenerator,

    private readonly tutorFeedbackService: TutorFeedbackService,

    private readonly progressService: ProgressService,

    private readonly gamificationService: GamificationService,

    private readonly adaptiveService: AdaptiveService,

    private readonly errorPatternsService: ErrorPatternsService,

  ) {}



  listTopics(): GrammarTopic[] {

    return [...ALL_GRAMMAR_TOPICS];

  }



  listTopicsForLevel(level: LearnerLevel): GrammarTopic[] {

    return [...GRAMMAR_TOPICS_BY_LEVEL[level]];

  }



  async getExercises(

    userId: string,

    level: LearnerLevel,

    topic: GrammarTopic,

  ): Promise<GetExercisesResult> {

    const userProgress = getOrCreateTopicProgress(userId, topic, level);

    userProgress.targetConcept = getWeakestConceptForTopic(userId, topic);

    const concept = userProgress.targetConcept ?? topic;

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'grammar',
      concept,
    );

    const generationLevel = effectiveLevelForDifficulty(
      level,
      difficultyState.difficulty_level,
    );



    const jsonPool = loadGrammarExercises(level, topic, this.moduleDir);

    const jsonRemaining = jsonPool.filter(

      (item) => !userProgress.completedIds.has(item.id),

    );



    const useAi =

      jsonRemaining.length === 0 || shouldGenerateAIExercise(userId, topic);



    let batch: GrammarExercise[];



    if (!useAi) {

      batch = jsonRemaining.slice(0, BATCH_SIZE);

    } else if (jsonRemaining.length > 0) {

      const jsonCount = Math.min(BATCH_SIZE - 1, jsonRemaining.length);

      batch = [

        ...jsonRemaining.slice(0, jsonCount),

        ...this.buildAiBatch(
          userId,
          topic,
          userProgress,
          BATCH_SIZE - jsonCount,
          generationLevel,
        ),

      ];

    } else {

      batch = this.buildAiBatch(
        userId,
        topic,
        userProgress,
        BATCH_SIZE,
        generationLevel,
      );

    }



    userProgress.totalServed += batch.length;



    this.logger.log(

      `user=${userId} level=${generationLevel} topic=${topic} batch=${batch.length} ai=${useAi} targetConcept=${concept} difficulty=${difficultyState.difficulty_level}`,

    );



    const jsonInBatch = batch.filter((item) => !item.id.startsWith('ai_')).length;

    const remainingAfterBatch = Math.max(0, jsonRemaining.length - jsonInBatch);



    return {

      exercises: batch.map((item) => toPublicExercise(item)),

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

    topic: GrammarTopic,

  ): Promise<SubmitAnswerResult> {

    const exercise = this.resolveExercise(exerciseId, level, topic);

    if (!exercise) {

      throw new NotFoundException('Exercise not found');

    }



    getOrCreateTopicProgress(userId, topic, level);



    const concept = identifyConcept(
      topic,
      userAnswer,
      exercise.correct_answer,
    );
    const evaluation = evaluateExerciseAnswer(userAnswer, exercise);
    const { isCorrect, normalizedUserAnswer, normalizedCorrectAnswer } =
      evaluation;

    if (isCorrect) {

      recordCorrect(userId, topic);

      recordConceptCorrect(userId, concept);

    } else {

      recordMistake(userId, topic);

      recordConceptMistake(userId, concept);

    }

    const difficultyState = await this.adaptiveService.recordResult(
      userId,
      'grammar',
      concept,
      isCorrect,
    );

    let errorPattern: SubmitAnswerResult['errorPattern'] = null;
    if (!isCorrect) {
      const stored = await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer,
        correctAnswer: exercise.correct_answer,
        module: 'grammar',
        concept,
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

    let grammarProgress: GrammarProgressUpdate | null = null;

    try {

      grammarProgress = isCorrect

        ? await this.progressService.incrementGrammarXP(userId, concept)

        : await this.progressService.recordGrammarMistake(userId, concept);

    } catch (error) {

      this.logger.warn(

        `Grammar progress update failed for user=${userId} concept=${concept}: ${error instanceof Error ? error.message : error}`,

      );

    }



    let xpEarned = 0;

    let currentStreak = 0;

    try {

      if (isCorrect) {
        const reward = await this.gamificationService.awardActivityXp(
          userId,
          'grammar_correct',
          { incrementStat: false },
        );
        currentStreak = reward.streak;
        xpEarned = reward.xpEarned;
      } else {
        currentStreak = await this.gamificationService.resetStreak(userId);
      }

    } catch (error) {

      this.logger.warn(

        `Gamification update failed for user=${userId}: ${error instanceof Error ? error.message : error}`,

      );

    }



    const userProgress = getOrCreateTopicProgress(userId, topic, level);

    userProgress.completedIds.add(exerciseId);



    const feedback = isCorrect
      ? this.buildCorrectFeedback(
          userId,
          exercise,
          concept,
          userProgress.effectiveLevel,
        )
      : this.buildIncorrectFeedback(
          userId,
          userAnswer,
          exercise,
          concept,
          userProgress.effectiveLevel,
        );



    this.logger.log(

      `user=${userId} topic=${topic} concept=${concept} correct=${isCorrect} mistakes=${userProgress.mistakeCount}`,

    );



    return {
      isCorrect,
      correctAnswer: exercise.correct_answer,
      normalizedUserAnswer,
      normalizedCorrectAnswer,
      explanation: exercise.explanation,
      feedback,
      effectiveLevel: userProgress.effectiveLevel,
      difficultyLevel: difficultyState.difficulty_level,
      errorPattern,
      topicMistakeCount: userProgress.mistakeCount,
      grammarProgress,
      xpEarned,
      currentStreak,
    };

  }



  generateAIExercise(

    userId: string,

    level: LearnerLevel,

    topic: GrammarTopic,

  ): GrammarExercisePublic {

    const userProgress = getOrCreateTopicProgress(userId, topic, level);

    userProgress.targetConcept = getWeakestConceptForTopic(userId, topic);

    const exercise = this.aiGenerator.generate(

      userId,

      userProgress.effectiveLevel,

      topic,

      userProgress.aiSequence,

      userProgress.targetConcept,

    );

    userProgress.aiSequence += 1;

    userProgress.totalServed += 1;

    userProgress.aiServed += 1;



    return toPublicExercise(exercise);

  }



  private buildCorrectFeedback(
    userId: string,
    exercise: GrammarExercise,
    concept: string,
    effectiveLevel: LearnerLevel,
  ): TutorFeedbackJson {
    const enriched = buildEnrichedFeedback({
      userId,
      level: effectiveLevel,
      isCorrect: true,
      conceptKey: concept,
      correctAnswer: exercise.correct_answer,
    });

    return {
      corrected_sentence: exercise.correct_answer,
      grammar_feedback: '',
      vocabulary_feedback: '',
      encouragement: enriched.encouragement ?? '',
      next_step: enriched.next_step ?? '',
      micro_lesson: null,
      concept_explanation: enriched.concept_explanation ?? '',
      examples: enriched.examples ?? [],
      counter_examples: enriched.counter_examples ?? [],
      mini_tip: enriched.mini_tip ?? '',
    };
  }

  private buildIncorrectFeedback(
    userId: string,
    userAnswer: string,
    exercise: GrammarExercise,
    concept: string,
    effectiveLevel: LearnerLevel,
  ): TutorFeedbackJson {
    const tutorFeedback = this.tutorFeedbackService.generateTutorFeedback({
      userSentence: buildTutorInputSentence(
        exercise,
        userAnswer,
        this.aiGenerator,
      ),
      userId,
      level: effectiveLevel,
    });

    const grammarFeedback = buildGrammarFeedback({
      userAnswer,
      correctAnswer: exercise.correct_answer,
      concept,
      exercise,
    });

    const correctedSentence =
      tutorFeedback.corrected_sentence.trim().length > 0
        ? tutorFeedback.corrected_sentence
        : exercise.correct_answer;

    const microLesson = shouldShowMicroLesson(userId, concept)
      ? formatMicroLessonForResponse(generateMicroLesson(concept))
      : null;

    if (microLesson) {
      this.logger.log(
        `user=${userId} concept=${concept} repeated_mistakes micro_lesson attached`,
      );
    }

    return {
      corrected_sentence: correctedSentence,
      grammar_feedback: grammarFeedback,
      vocabulary_feedback: tutorFeedback.vocabulary_feedback,
      encouragement: tutorFeedback.encouragement,
      next_step: tutorFeedback.next_step,
      micro_lesson: microLesson,
      concept_explanation: tutorFeedback.concept_explanation ?? '',
      examples: tutorFeedback.examples ?? [],
      counter_examples: tutorFeedback.counter_examples ?? [],
      mini_tip: tutorFeedback.mini_tip ?? '',
    };
  }



  private buildAiBatch(

    userId: string,

    topic: GrammarTopic,

    userProgress: TopicProgress,

    count: number,

    generationLevel: LearnerLevel,

  ): GrammarExercise[] {

    const batch: GrammarExercise[] = [];

    for (let i = 0; i < count; i += 1) {

      batch.push(

        this.aiGenerator.generate(

          userId,

          generationLevel,

          topic,

          userProgress.aiSequence,

          userProgress.targetConcept,

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

    topic: GrammarTopic,

  ): GrammarExercise | null {

    const generated = this.aiGenerator.findById(exerciseId);

    if (generated) {

      return generated;

    }



    const jsonPool = loadGrammarExercises(level, topic, this.moduleDir);

    return jsonPool.find((item) => item.id === exerciseId) ?? null;

  }

}


