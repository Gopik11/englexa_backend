import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { AskQuestionDto } from './dto/ask-question.dto';
import { PracticeDto } from './dto/practice.dto';
import { VoiceInputDto } from './dto/voice-input.dto';
import { SpokenEnglishService } from './spoken-english.service';
import {
  ensureAudioPayload,
  mapVoiceResponse,
  rejectLocalFilePath,
  UploadedAudioFile,
} from './utils/voice-audio.util';
import { normalizePracticeResult } from './utils/response-normalizer.util';

@Controller('spoken-english')
@UseGuards(JwtAuthGuard)
export class SpokenEnglishController {
  private readonly logger = new Logger(SpokenEnglishController.name);

  constructor(private readonly spokenEnglishService: SpokenEnglishService) {}

  @Post('ask')
  async askQuestion(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: AskQuestionDto,
  ) {
    try {
      const result = await this.spokenEnglishService.askQuestion(user.sub, dto);
      return normalizeResponse({
        english: result.english ?? '',
        local: result.local ?? '',
        audioBase64: result.audioBase64 ?? '',
        confidenceTip: result.confidenceTip ?? '',
        detectedLanguage: result.detectedLanguage ?? 'en',
        translatedQuestion: result.translatedQuestion ?? '',
        aiDegraded: result.aiDegraded ?? false,
      });
    } catch (err) {
      this.logger.error(
        `ask route failed user=${user.sub}`,
        err instanceof Error ? err.message : err,
      );
      const fallback = await this.spokenEnglishService.askQuestion(user.sub, dto);
      return normalizeResponse(
        {
          english: fallback.english ?? '',
          local: fallback.local ?? '',
          audioBase64: '',
          confidenceTip: fallback.confidenceTip ?? '',
          detectedLanguage: fallback.detectedLanguage ?? 'en',
          translatedQuestion: fallback.translatedQuestion ?? dto.text,
          aiDegraded: true,
        },
        'AI temporarily unavailable — showing offline guidance',
      );
    }
  }

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async processVoice(
    @CurrentUser() user: AuthJwtPayload,
    @UploadedFile() file?: UploadedAudioFile,
    @Body('languageHint') languageHint?: string,
    @Body('audioBase64') audioBase64?: string,
    @Body('mimeType') mimeType?: string,
    @Body('audioUrl') audioUrl?: string,
    @Body('audioBlobRef') audioBlobRef?: string,
  ) {
    rejectLocalFilePath(audioBlobRef);

    try {
      const payload = ensureAudioPayload(file, audioBase64, audioUrl);
      const dto: VoiceInputDto = {
        audioBase64: payload.audioBase64,
        mimeType: payload.mimeType,
        languageHint,
      };

      const result = await this.spokenEnglishService.processVoiceInput(
        user.sub,
        dto,
      );

      return normalizeResponse(mapVoiceResponse(result));
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(
        `voice route failed user=${user.sub}`,
        err instanceof Error ? err.message : err,
      );
      throw new BadRequestException(
        'Unable to process voice input. Upload multipart field "file" with your recording.',
      );
    }
  }

  @Post('practice')
  async practice(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: PracticeDto,
  ) {
    try {
      const result = normalizePracticeResult(
        await this.spokenEnglishService.practice(user.sub, dto),
      );
      return normalizeResponse({
        promptId: result.promptId,
        prompt: result.prompt,
        exampleAnswer: result.exampleAnswer ?? '',
        userResponse: result.userResponse,
        grammarScore: result.grammarScore,
        pronunciationScore: result.pronunciationScore,
        fluencyScore: result.fluencyScore,
        confidenceScore: result.confidenceScore ?? 0,
        feedback: result.feedback ?? '',
        encouragement: result.encouragement ?? '',
        grammarFeedback: result.grammarFeedback ?? '',
        pronunciationFeedback: result.pronunciationFeedback ?? '',
        overallFeedback: result.overallFeedback ?? '',
        suggestedImprovement: result.suggestedImprovement ?? '',
        confidenceTip: result.confidenceTip ?? '',
        localFeedback: result.localFeedback ?? '',
        audioBase64: result.audioBase64 ?? '',
        aiDegraded: result.aiDegraded ?? false,
      });
    } catch (err) {
      this.logger.error(
        `practice route failed user=${user.sub}`,
        err instanceof Error ? err.message : err,
      );
      const fallback = await this.spokenEnglishService.practice(user.sub, dto);
      const result = normalizePracticeResult(fallback);
      return normalizeResponse(
        {
          promptId: result.promptId,
          prompt: result.prompt,
          exampleAnswer: result.exampleAnswer ?? '',
          userResponse: result.userResponse,
          grammarScore: result.grammarScore,
          pronunciationScore: result.pronunciationScore,
          fluencyScore: result.fluencyScore,
          confidenceScore: result.confidenceScore ?? 0,
          feedback: result.feedback ?? '',
          encouragement: result.encouragement ?? '',
          grammarFeedback: result.grammarFeedback ?? '',
          pronunciationFeedback: result.pronunciationFeedback ?? '',
          overallFeedback: result.overallFeedback ?? '',
          suggestedImprovement: result.suggestedImprovement ?? '',
          confidenceTip: result.confidenceTip ?? '',
          localFeedback: result.localFeedback ?? '',
          audioBase64: '',
          aiDegraded: true,
        },
        'AI temporarily unavailable — showing offline feedback',
      );
    }
  }
}
