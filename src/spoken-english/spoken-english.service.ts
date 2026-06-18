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

import { rejectLocalFilePath } from '../common/utils/audio-upload.util';

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

  aiDegraded?: boolean;

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

  aiDegraded?: boolean;

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

    const startedAt = Date.now();

    this.logger.log(`ask user=${userId} textLength=${dto.text.length}`);



    try {

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



      this.logger.log(`ask ok user=${userId} durationMs=${Date.now() - startedAt}`);



      return {

        english: explanation.explanation ?? '',

        local: localExplanation ?? '',

        audioBase64: audioBase64 ?? '',

        confidenceTip: buildConfidenceTip(`${userId}:${dto.text}`),

        detectedLanguage,

        translatedQuestion: translatedQuestion ?? '',

        aiDegraded: !audioBase64 && !explanation.explanation,

      };

    } catch (err) {

      this.logger.error(

        `ask failed user=${userId} durationMs=${Date.now() - startedAt}`,

        err instanceof Error ? err.message : err,

      );

      return this.buildAskFallback(userId, dto.text, dto.languageHint);

    }

  }



  async processVoiceInput(

    userId: string,

    dto: VoiceInputDto,

  ): Promise<VoiceInputResult> {

    const startedAt = Date.now();



    try {

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

        throw new BadRequestException(

          'Could not transcribe audio. Speak clearly and try again.',

        );

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



      this.logger.log(

        `voice ok user=${userId} durationMs=${Date.now() - startedAt}`,

      );



      return normalizeVoiceResult({

        ...askResult,

        transcribedText: transcription.text,

        confidenceScore: confidence.confidenceScore,

        feedback: confidence.feedback,

        encouragement: confidence.encouragement,

      });

    } catch (err) {

      if (err instanceof BadRequestException) {

        throw err;

      }

      this.logger.error(

        `voice failed user=${userId} durationMs=${Date.now() - startedAt}`,

        err instanceof Error ? err.message : err,

      );

      throw new BadRequestException(

        'Unable to process voice input. Upload a valid audio file and try again.',

      );

    }

  }



  async practice(userId: string, dto: PracticeDto): Promise<PracticeResult> {

    const language = normalizeLanguageCode(dto.languageHint);

    const startedAt = Date.now();

    this.logger.log(`practice user=${userId} language=${language}`);



    try {

      const generatedPrompt = dto.prompt

        ? {

            promptId: dto.promptId ?? `practice_${Date.now()}`,

            prompt: dto.prompt,

            exampleAnswer: '',

            aiDegraded: false,

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



      this.logger.log(

        `practice ok user=${userId} durationMs=${Date.now() - startedAt}`,

      );



      return normalizePracticeResult({

        promptId: generatedPrompt.promptId,

        prompt: generatedPrompt.prompt,

        exampleAnswer: generatedPrompt.exampleAnswer ?? '',

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

        aiDegraded: evaluation.aiDegraded ?? generatedPrompt.aiDegraded,

      });

    } catch (err) {

      this.logger.error(

        `practice failed user=${userId} durationMs=${Date.now() - startedAt}`,

        err instanceof Error ? err.message : err,

      );

      return this.buildPracticeFallback(userId, dto, language);

    }

  }



  listSupportedLanguages() {

    return SUPPORTED_LANGUAGE_LABELS;

  }



  private buildAskFallback(

    userId: string,

    text: string,

    languageHint?: string,

  ): AskQuestionResult {

    const detectedLanguage = normalizeLanguageCode(languageHint ?? 'en');

    return {

      english: `Practice saying: "${text}" clearly and at a steady pace.`,

      local: text,

      audioBase64: '',

      confidenceTip: buildConfidenceTip(`${userId}:${text}`),

      detectedLanguage,

      translatedQuestion: text,

      aiDegraded: true,

    };

  }



  private buildPracticeFallback(

    userId: string,

    dto: PracticeDto,

    language: SupportedLanguageCode,

  ): PracticeResult {

    const prompt =

      dto.prompt ?? 'Introduce yourself in one or two clear sentences.';

    const promptId = dto.promptId ?? `practice_${Date.now()}`;



    return normalizePracticeResult({

      promptId,

      prompt,

      exampleAnswer: '',

      userResponse: dto.userResponse,

      grammarScore: 70,

      pronunciationScore: 70,

      fluencyScore: 70,

      grammarFeedback:

        'Keep practicing with short sentences. Focus on subject + verb order.',

      pronunciationFeedback:

        'Speak slowly and stress the main words in each sentence.',

      overallFeedback:

        'Good effort! AI feedback is temporarily unavailable — keep practicing.',

      suggestedImprovement:

        'Record yourself, listen back, and repeat the prompt three times.',

      confidenceTip: buildPracticeConfidenceTip({

        grammarScore: 70,

        pronunciationScore: 70,

        fluencyScore: 70,

      }),

      confidenceScore: 70,

      feedback: 'Keep going — consistency matters more than perfection.',

      encouragement: "You're building confidence with every attempt.",

      audioBase64: '',

      localFeedback:

        'Good effort! AI feedback is temporarily unavailable — keep practicing.',

      aiDegraded: true,

    });

  }



  private async resolveAudioBase64(dto: VoiceInputDto): Promise<string> {

    rejectLocalFilePath(dto.audioBase64);

    rejectLocalFilePath(dto.audioUrl);



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


