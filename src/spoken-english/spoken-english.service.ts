import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AiContentProviderService } from '../modules/content-pipeline/providers/ai-content-provider.service';
import { ConfidenceService } from './confidence/confidence.service';
import {
  normalizeLanguageCode,
  SUPPORTED_LANGUAGE_LABELS,
  SupportedLanguageCode,
} from './constants/supported-languages.constants';
import { AskQuestionDto } from './dto/ask-question.dto';
import { PracticeDto } from './dto/practice.dto';
import { VoiceInputDto } from './dto/voice-input.dto';
import {
  buildConfidenceTip,
  buildPracticeConfidenceTip,
} from './utils/confidence-builder.util';
import {
  normalizePracticeResult,
  normalizeVoiceResult,
} from './utils/response-normalizer.util';

export interface AskQuestionResult {
  english: string;
  local: string;
  audioBase64: string;
  confidenceTip: string;
  detectedLanguage: SupportedLanguageCode;
  translatedQuestion: string;
  confidenceScore?: number;
  feedback?: string;
  encouragement?: string;
}

export interface VoiceInputResult extends AskQuestionResult {
  transcribedText: string;
  feedback: string;
  encouragement: string;
}

export interface PracticeResult {
  promptId: string;
  prompt: string;
  exampleAnswer: string;
  userResponse: string;
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarFeedback: string;
  pronunciationFeedback: string;
  overallFeedback: string;
  suggestedImprovement: string;
  confidenceTip: string;
  confidenceScore: number;
  feedback: string;
  encouragement: string;
  audioBase64: string;
  localFeedback: string;
}

@Injectable()
export class SpokenEnglishService {
  private readonly logger = new Logger(SpokenEnglishService.name);

  constructor(
    private readonly aiProvider: AiContentProviderService,
    private readonly confidenceService: ConfidenceService,
  ) {}

  async askQuestion(
    userId: string,
    dto: AskQuestionDto,
  ): Promise<AskQuestionResult> {
    this.logger.log(`ask user=${userId} textLength=${dto.text.length}`);

    const detectedLanguage = normalizeLanguageCode(
      dto.languageHint ?? (await this.aiProvider.detectLanguage(dto.text)),
    );

    const translatedQuestion =
      detectedLanguage === 'en'
        ? dto.text
        : await this.aiProvider.translate(dto.text, detectedLanguage, 'en');

    const explanation = await this.aiProvider.explainEnglish(dto.text, {
      translatedQuestion,
      sourceLanguage: detectedLanguage,
    });

    const localExplanation =
      detectedLanguage === 'en'
        ? explanation.explanation
        : await this.aiProvider.translate(
            explanation.explanation,
            'en',
            detectedLanguage,
          );

    const audioBase64 = await this.aiProvider.textToSpeech(
      localExplanation,
      detectedLanguage,
    );

    return {
      english: explanation.explanation ?? '',
      local: localExplanation ?? '',
      audioBase64: audioBase64 ?? '',
      confidenceTip: buildConfidenceTip(`${userId}:${dto.text}`),
      detectedLanguage,
      translatedQuestion: translatedQuestion ?? '',
    };
  }

  async processVoiceInput(
    userId: string,
    dto: VoiceInputDto,
  ): Promise<VoiceInputResult> {
    const audioBase64 = await this.resolveAudioBase64(dto);
    this.logger.log(`voice user=${userId} audioBytes=${audioBase64.length}`);

    const languageHint = dto.languageHint
      ? normalizeLanguageCode(dto.languageHint)
      : undefined;

    const transcription = await this.aiProvider.speechToText(audioBase64, {
      languageHint,
      mimeType: dto.mimeType,
    });

    if (!transcription.text.trim()) {
      throw new BadRequestException('Could not transcribe audio input');
    }

    const detectedLanguage = normalizeLanguageCode(transcription.language);
    const confidence = await this.confidenceService.evaluateAndPersist({
      userId,
      prompt: 'Voice interaction',
      userResponse: transcription.text,
      language: detectedLanguage,
    });

    const askResult = await this.askQuestion(userId, {
      text: transcription.text,
      languageHint: detectedLanguage,
    });

    return normalizeVoiceResult({
      ...askResult,
      transcribedText: transcription.text,
      confidenceScore: confidence.confidenceScore,
      feedback: confidence.feedback,
      encouragement: confidence.encouragement,
    });
  }

  async practice(userId: string, dto: PracticeDto): Promise<PracticeResult> {
    const language = normalizeLanguageCode(dto.languageHint);
    this.logger.log(`practice user=${userId} language=${language}`);

    const generatedPrompt = dto.prompt
      ? {
          promptId: dto.promptId ?? `practice_${Date.now()}`,
          prompt: dto.prompt,
          exampleAnswer: '',
        }
      : await this.aiProvider.generatePracticePrompt({
          level: dto.level,
          language,
        });

    const evaluation = await this.aiProvider.evaluateSpeakingPractice({
      prompt: generatedPrompt.prompt,
      userResponse: dto.userResponse,
      level: dto.level,
      language,
    });

    const confidence = await this.confidenceService.evaluateAndPersist({
      userId,
      sessionId: generatedPrompt.promptId,
      prompt: generatedPrompt.prompt,
      userResponse: dto.userResponse,
      language,
    });

    const localFeedback =
      language === 'en'
        ? evaluation.overallFeedback
        : await this.aiProvider.translate(
            evaluation.overallFeedback,
            'en',
            language,
          );

    const audioBase64 = await this.aiProvider.textToSpeech(
      localFeedback,
      language,
    );

    const confidenceTip = buildPracticeConfidenceTip({
      grammarScore: evaluation.grammarScore,
      pronunciationScore: evaluation.pronunciationScore,
      fluencyScore: evaluation.fluencyScore,
    });

    return normalizePracticeResult({
      promptId: generatedPrompt.promptId,
      prompt: generatedPrompt.prompt,
      exampleAnswer: generatedPrompt.exampleAnswer,
      userResponse: dto.userResponse,
      grammarScore: evaluation.grammarScore,
      pronunciationScore: evaluation.pronunciationScore,
      fluencyScore: evaluation.fluencyScore,
      grammarFeedback: evaluation.grammarFeedback,
      pronunciationFeedback: evaluation.pronunciationFeedback,
      overallFeedback: evaluation.overallFeedback,
      suggestedImprovement: evaluation.suggestedImprovement,
      confidenceTip,
      confidenceScore: confidence.confidenceScore,
      feedback: confidence.feedback,
      encouragement: confidence.encouragement,
      audioBase64,
      localFeedback,
    });
  }

  listSupportedLanguages() {
    return SUPPORTED_LANGUAGE_LABELS;
  }

  private async resolveAudioBase64(dto: VoiceInputDto): Promise<string> {
    if (dto.audioBase64?.trim()) {
      return dto.audioBase64.trim();
    }

    if (dto.audioUrl?.trim()) {
      try {
        const response = await fetch(dto.audioUrl.trim());
        if (!response.ok) {
          throw new Error(`Audio fetch failed with status ${response.status}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer.toString('base64');
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException('Unable to fetch audio from audioUrl');
      }
    }

    throw new BadRequestException('audioBase64 or audioUrl is required');
  }
}
