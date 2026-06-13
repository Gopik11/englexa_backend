import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { GetSpeakingPromptDto } from './dto/get-speaking-prompt.dto';
import { SubmitSpeakingAudioDto } from './dto/submit-speaking-audio.dto';
import { SpeakingPracticeService } from './speaking-practice.service';
import { validateSpeakingTopicForLevel } from './utils/validate-speaking-params';

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingPracticeController {
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

    return successResponse(result);
  }

  @Post('submit')
  async submitSpeakingAudio(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitSpeakingAudioDto,
  ) {
    validateSpeakingTopicForLevel(dto.level, dto.topic);

    const result = await this.speakingPracticeService.submitSpeakingAudio(
      user.sub,
      dto.promptId,
      {
        audioUrl: dto.audioUrl,
        audioBlobRef: dto.audioBlobRef,
      },
      dto.level,
      dto.topic,
    );

    return successResponse({
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
      ...mapEnrichedFeedbackToApi(result),
    });
  }
}
