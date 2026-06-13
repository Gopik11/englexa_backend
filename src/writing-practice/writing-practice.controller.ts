import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { GetWritingPromptDto } from './dto/get-writing-prompt.dto';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { WritingPracticeService } from './writing-practice.service';
import { validateWritingTopicForLevel } from './utils/validate-writing-params';

@Controller('writing')
@UseGuards(JwtAuthGuard)
export class WritingPracticeController {
  constructor(private readonly writingPracticeService: WritingPracticeService) {}

  @Get(':level/:topic')
  async getWritingPrompt(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetWritingPromptDto,
  ) {
    validateWritingTopicForLevel(params.level, params.topic);

    const result = await this.writingPracticeService.getWritingPrompt(
      user.sub,
      params.level,
      params.topic,
    );

    return successResponse(result);
  }

  @Post('submit')
  async submitWriting(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitWritingDto,
  ) {
    validateWritingTopicForLevel(dto.level, dto.topic);

    const result = await this.writingPracticeService.submitWriting(
      user.sub,
      dto.level,
      dto.topic,
      dto.text,
    );

    return successResponse({
      corrected_text: result.correctedText,
      grammar_feedback: result.grammarFeedback,
      vocabulary_feedback: result.vocabularyFeedback,
      coherence_feedback: result.coherenceFeedback,
      structure_feedback: result.structureFeedback,
      micro_lesson: result.microLesson,
      xp_earned: result.xpEarned ?? 0,
      streak: result.streak ?? 0,
      difficultyLevel: result.difficultyLevel ?? 1,
      errorPattern: result.errorPattern ?? null,
      ...mapEnrichedFeedbackToApi(result),
    });
  }
}
