import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  rejectLocalFilePath,
  UploadedAudioFile,
  validateUploadedAudioFile,
} from '../common/utils/audio-upload.util';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { GetSpeakingPromptDto } from './dto/get-speaking-prompt.dto';
import { SpeakingPracticeService } from './speaking-practice.service';
import { validateSpeakingTopicForLevel } from './utils/validate-speaking-params';

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingPracticeController {
  private readonly logger = new Logger(SpeakingPracticeController.name);

  constructor(private readonly speakingPracticeService: SpeakingPracticeService) {}

  @Get(':level/:topic')
  async getSpeakingPrompt(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetSpeakingPromptDto,
  ) {
    validateSpeakingTopicForLevel(params.level, params.topic);

    const result = await this.speakingPracticeService.getSpeakingPrompt(
      user.sub,
      params.level,
      params.topic,
    );

    return normalizeResponse(result);
  }

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async submitSpeakingAudio(
    @CurrentUser() user: AuthJwtPayload,
    @UploadedFile() file: UploadedAudioFile | undefined,
    @Body('promptId') promptId: string,
    @Body('level') level: GetSpeakingPromptDto['level'],
    @Body('topic') topic: GetSpeakingPromptDto['topic'],
    @Body('audioBlobRef') audioBlobRef?: string,
    @Body('audioUrl') audioUrl?: string,
  ) {
    rejectLocalFilePath(audioBlobRef);
    rejectLocalFilePath(audioUrl);

    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No audio file received. Upload multipart field "file" with your recording. Local file paths (file://) are not accepted.',
      );
    }

    validateUploadedAudioFile(file);

    if (!promptId?.trim()) {
      throw new BadRequestException('promptId is required.');
    }

    validateSpeakingTopicForLevel(level, topic);

    try {
      const result = await this.speakingPracticeService.submitSpeakingAudio(
        user.sub,
        promptId.trim(),
        {
          audioBase64: file.buffer.toString('base64'),
          mimeType: file.mimetype || 'audio/mp4',
        },
        level,
        topic,
      );

      return normalizeResponse({
        transcript: result.transcript,
        pronunciation_score: result.pronunciationScore,
        fluency_score: result.fluencyScore,
        grammar_feedback: result.grammarFeedback,
        vocabulary_feedback: result.vocabularyFeedback,
        micro_lesson: result.microLesson,
        xp_earned: result.xpEarned ?? 0,
        streak: result.streak ?? 0,
        difficultyLevel: result.difficultyLevel ?? 1,
        errorPattern: result.errorPattern ?? null,
        aiDegraded: result.aiDegraded ?? false,
        ...mapEnrichedFeedbackToApi(result),
      });
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(
        `speaking/submit failed user=${user.sub} prompt=${promptId}`,
        err instanceof Error ? err.message : err,
      );
      throw new BadRequestException(
        'Unable to evaluate your recording. Please try again with a clear audio file.',
      );
    }
  }
}
