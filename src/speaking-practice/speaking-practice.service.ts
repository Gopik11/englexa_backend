import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { GamificationService } from '../gamification/gamification.service';
import { MasteryService } from '../mastery/mastery.service';
import { ProfileService } from '../profile/profile.service';
import { effectiveLevelForDifficulty } from '../mastery/utils/difficulty-adjuster';
import {
  ALL_SPEAKING_TOPICS,
  SPEAKING_TOPICS_BY_LEVEL,
} from '../content/speaking-topics.constants';
import {
  GetSpeakingPromptResult,
  SpeakingPrompt,
  SpeakingPromptPublic,
  SpeakingTopic,
  SubmitSpeakingAudioResult,
} from './interfaces/speaking-prompt.interface';
import { AiSpeakingPromptGenerator } from './utils/ai-speaking-prompt-generator';
import { loadSpeakingPrompts } from './utils/content-loader';
import {
  getOrCreateSpeakingTopicProgress,
  recordSpeakingAttempt,
} from './utils/speaking-adaptive-logic';
import {
  SpeakingAudioPayload,
  SpeakingEvaluator,
} from './utils/speaking-evaluator';

@Injectable()
export class SpeakingPracticeService {
  private readonly logger = new Logger(SpeakingPracticeService.name);
  private readonly moduleDir = __dirname;

  constructor(
    private readonly aiGenerator: AiSpeakingPromptGenerator,
    private readonly speakingEvaluator: SpeakingEvaluator,
    private readonly gamificationService: GamificationService,
    private readonly masteryService: MasteryService,
    private readonly adaptiveService: AdaptiveService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly profileService: ProfileService,
  ) {}

  listTopics(): SpeakingTopic[] {
    return [...ALL_SPEAKING_TOPICS];
  }

  listTopicsForLevel(level: LearnerLevel): SpeakingTopic[] {
    return [...SPEAKING_TOPICS_BY_LEVEL[level]];
  }

  async getSpeakingPrompt(
    userId: string,
    level: LearnerLevel,
    topic: SpeakingTopic,
  ): Promise<GetSpeakingPromptResult> {
    const userProgress = getOrCreateSpeakingTopicProgress(userId, topic, level);

    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'speaking',
      topic,
    );
    const generationLevel = effectiveLevelForDifficulty(
      level,
      difficultyState.difficulty_level,
    );

    const jsonPool = loadSpeakingPrompts(level, topic, this.moduleDir);
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

  async submitSpeakingAudio(
    userId: string,
    promptId: string,
    audio: SpeakingAudioPayload,
    level: LearnerLevel,
    topic: SpeakingTopic,
  ): Promise<SubmitSpeakingAudioResult> {
    if (!audio.audioBase64?.trim()) {
      throw new BadRequestException(
        'No audio data received. Upload multipart field "file".',
      );
    }

    const prompt = this.resolvePrompt(promptId, level, topic);
    if (!prompt) {
      throw new NotFoundException('Speaking prompt not found');
    }

    const userProgress = getOrCreateSpeakingTopicProgress(userId, topic, level);

    let result: SubmitSpeakingAudioResult;
    try {
      result = await this.speakingEvaluator.evaluateSpeaking({
        userId,
        prompt,
        audio,
        level: userProgress.effectiveLevel,
      });
    } catch (err) {
      this.logger.error(
        `speaking evaluation failed user=${userId} prompt=${promptId}`,
        err instanceof Error ? err.message : err,
      );
      result = await this.speakingEvaluator.evaluateSpeaking({
        userId,
        prompt,
        audio: { audioBase64: audio.audioBase64, mimeType: audio.mimeType },
        level: userProgress.effectiveLevel,
      });
      result = { ...result, aiDegraded: true };
    }

    const averageScore = Math.round(
      (result.pronunciationScore + result.fluencyScore) / 2,
    );
    recordSpeakingAttempt(userId, topic, averageScore);
    userProgress.completedPromptIds.add(promptId);

    this.logger.log(
      `user=${userId} topic=${topic} prompt=${promptId} pronunciation=${result.pronunciationScore} fluency=${result.fluencyScore}`,
    );

    const reward = await this.gamificationService.awardActivityXp(
      userId,
      'speaking_submission',
    );
    const isCorrect = averageScore >= 60;
    await this.profileService.awardXpForActivity(userId, 'speaking', {
      perfectAccuracy: averageScore >= 90,
    });
    await this.masteryService.recordConceptActivity(userId, 'speaking', topic, {
      correct: isCorrect,
    });

    const difficultyState = await this.adaptiveService.recordResult(
      userId,
      'speaking',
      topic,
      isCorrect,
    );

    let errorPattern: SubmitSpeakingAudioResult['errorPattern'] = null;
    if (!isCorrect) {
      const stored = await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer: result.transcript,
        correctAnswer: prompt.reference_text ?? prompt.prompt,
        module: 'speaking',
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

  private resolvePrompt(
    promptId: string,
    level: LearnerLevel,
    topic: SpeakingTopic,
  ): SpeakingPrompt | null {
    const generated = this.aiGenerator.findById(promptId);
    if (generated) {
      return generated;
    }

    const jsonPool = loadSpeakingPrompts(level, topic, this.moduleDir);
    return jsonPool.find((item) => item.id === promptId) ?? null;
  }
}

function toPublicPrompt(prompt: SpeakingPrompt): SpeakingPromptPublic {
  return {
    id: prompt.id,
    level: prompt.level,
    topic: prompt.topic,
    title: prompt.title,
    prompt: prompt.prompt,
    time_limit_seconds: prompt.time_limit_seconds,
  };
}
