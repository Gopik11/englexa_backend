import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { AskQuestionDto } from './dto/ask-question.dto';
import { PracticeDto } from './dto/practice.dto';
import { VoiceInputDto } from './dto/voice-input.dto';
import { SpokenEnglishService } from './spoken-english.service';
import {
  mapVoiceResponse,
  UploadedAudioFile,
  validateUploadedAudioFile,
} from './utils/voice-audio.util';

@Controller('spoken-english')
@UseGuards(JwtAuthGuard)
export class SpokenEnglishController {
  constructor(private readonly spokenEnglishService: SpokenEnglishService) {}

  @Post('ask')
  async askQuestion(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: AskQuestionDto,
  ) {
    const result = await this.spokenEnglishService.askQuestion(user.sub, dto);
    return successResponse({
      english: result.english ?? '',
      local: result.local ?? '',
      audioBase64: result.audioBase64 ?? '',
      confidenceTip: result.confidenceTip ?? '',
      detectedLanguage: result.detectedLanguage ?? 'en',
      translatedQuestion: result.translatedQuestion ?? '',
    });
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
  ) {
    let dto: VoiceInputDto;

    if (file?.buffer?.length) {
      validateUploadedAudioFile(file);
      dto = {
        audioBase64: file.buffer.toString('base64'),
        mimeType: file.mimetype || mimeType || 'audio/mp4',
        languageHint,
      };
    } else if (audioBase64?.trim() || audioUrl?.trim()) {
      dto = {
        audioBase64: audioBase64?.trim(),
        mimeType: mimeType || 'audio/mp4',
        audioUrl: audioUrl?.trim(),
        languageHint,
      };
    } else {
      throw new BadRequestException(
        'No audio file received. Upload multipart field "file" or send audioBase64.',
      );
    }

    const result = await this.spokenEnglishService.processVoiceInput(
      user.sub,
      dto,
    );

    return successResponse(mapVoiceResponse(result));
  }

  @Post('practice')
  async practice(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: PracticeDto,
  ) {
    const result = await this.spokenEnglishService.practice(user.sub, dto);
    return successResponse({
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
    });
  }
}
