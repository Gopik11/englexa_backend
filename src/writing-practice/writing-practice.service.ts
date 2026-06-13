import { Injectable, Logger } from '@nestjs/common';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { effectiveLevelForDifficulty } from '../mastery/utils/difficulty-adjuster';
import {
  ALL_WRITING_TOPICS,
  WRITING_TOPICS_BY_LEVEL,
} from '../content/writing-topics.constants';
import {
  GetWritingPromptResult,
  SubmitWritingResult,
  WritingPrompt,
  WritingPromptPublic,
  WritingTopic,
} from './interfaces/writing-prompt.interface';
import { AiWritingPromptGenerator } from './utils/ai-writing-prompt-generator';
import { loadWritingPrompts } from './utils/content-loader';
import {
  getOrCreateWritingTopicProgress,
  markPromptCompleted,
  recordWritingAttempt,
} from './utils/writing-adaptive-logic';
import { WritingEvaluator } from './utils/writing-evaluator';

@Injectable()
export class WritingPracticeService {
  private readonly logger = new Logger(WritingPracticeService.name);
  private readonly moduleDir = __dirname;

  constructor(
    private readonly aiGenerator: AiWritingPromptGenerator,
    private readonly writingEvaluator: WritingEvaluator,
    private readonly gamificationService: GamificationService,
    private readonly masteryService: MasteryService,
    private readonly adaptiveService: AdaptiveService,
    private readonly errorPatternsService: ErrorPatternsService,
  ) {}

  listTopics(): WritingTopic[] {
    return [...ALL_WRITING_TOPICS];
  }

  listTopicsForLevel(level: LearnerLevel): WritingTopic[] {
    return [...WRITING_TOPICS_BY_LEVEL[level]];
  }

  async getWritingPrompt(
    userId: string,
    level: LearnerLevel,
    topic: WritingTopic,
  ): Promise<GetWritingPromptResult> {
    const userProgress = getOrCreateWritingTopicProgress(userId, topic, level);

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'writing',
      topic,
    );
    const generationLevel = effectiveLevelForDifficulty(
      level,
      difficultyState.difficulty_level,
    );

    const jsonPool = loadWritingPrompts(level, topic, this.moduleDir);
    const jsonRemaining = jsonPool.filter(
      (item) => !userProgress.completedPromptIds.has(item.id),
    );

    const useAi = jsonRemaining.length === 0;
    const prompt = useAi
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
    userProgress.lastServedPromptId = prompt.id;

    this.logger.log(
      `user=${userId} level=${generationLevel} topic=${topic} prompt=${prompt.id} ai=${useAi} difficulty=${difficultyState.difficulty_level}`,
    );

    return {
      prompt: toPublicPrompt(prompt),
      effectiveLevel: generationLevel,
      difficultyLevel: difficultyState.difficulty_level,
      hasMore: jsonRemaining.length > 1 || useAi,
      jsonRemaining: Math.max(0, jsonRemaining.length - (useAi ? 0 : 1)),
    };
  }

  async submitWriting(
    userId: string,
    level: LearnerLevel,
    topic: WritingTopic,
    text: string,
  ): Promise<SubmitWritingResult> {
    const userProgress = getOrCreateWritingTopicProgress(userId, topic, level);
    const prompt = this.resolveLastPrompt(userId, level, topic, userProgress.lastServedPromptId);

    const result = this.writingEvaluator.evaluateWriting({
      userId,
      level: userProgress.effectiveLevel,
      topic,
      text,
      prompt,
    });

    const qualityScore = this.estimateQualityFromResult(result);
    recordWritingAttempt(userId, topic, qualityScore);

    if (userProgress.lastServedPromptId) {
      markPromptCompleted(userId, topic, userProgress.lastServedPromptId);
    }

    this.logger.log(
      `user=${userId} topic=${topic} words=${text.trim().split(/\s+/).length} quality=${qualityScore}`,
    );

    const reward = await this.gamificationService.awardActivityXp(
      userId,
      'writing_submission',
    );
    const isCorrect = qualityScore >= 60;
    await this.masteryService.recordConceptActivity(userId, 'writing', topic, {
      correct: isCorrect,
    });

    const difficultyState = await this.adaptiveService.recordResult(
      userId,
      'writing',
      topic,
      isCorrect,
    );

    let errorPattern: SubmitWritingResult['errorPattern'] = null;
    if (!isCorrect) {
      const stored = await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer: text,
        correctAnswer: result.correctedText || prompt?.prompt || text,
        module: 'writing',
        concept: topic,
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
      ...result,
      xpEarned: reward.xpEarned,
      streak: reward.streak,
      difficultyLevel: difficultyState.difficulty_level,
      errorPattern,
    };
  }

  private resolveLastPrompt(
    userId: string,
    level: LearnerLevel,
    topic: WritingTopic,
    promptId: string | null,
  ): WritingPrompt | null {
    if (!promptId) {
      return null;
    }

    const generated = this.aiGenerator.findById(promptId);
    if (generated) {
      return generated;
    }

    const jsonPool = loadWritingPrompts(level, topic, this.moduleDir);
    return jsonPool.find((item) => item.id === promptId) ?? null;
  }

  private estimateQualityFromResult(result: SubmitWritingResult): number {
    let score = 70;
    if (!result.coherenceFeedback.startsWith('Add linking')) {
      score += 10;
    }
    if (
      result.structureFeedback.includes('Strong structure') ||
      result.structureFeedback.includes('Good use of paragraphs') ||
      result.structureFeedback.includes('enough development')
    ) {
      score += 10;
    }
    if (result.microLesson == null) {
      score += 10;
    }
    return Math.min(100, score);
  }
}

function toPublicPrompt(prompt: WritingPrompt): WritingPromptPublic {
  return {
    id: prompt.id,
    level: prompt.level,
    topic: prompt.topic,
    title: prompt.title,
    prompt: prompt.prompt,
    word_count_min: prompt.word_count_min,
    word_count_max: prompt.word_count_max,
  };
}
