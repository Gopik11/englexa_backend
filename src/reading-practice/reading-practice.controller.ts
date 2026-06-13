import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { GetReadingPassageDto } from './dto/get-reading-passage.dto';
import { SubmitReadingAnswerDto } from './dto/submit-reading-answer.dto';
import { ReadingPracticeService } from './reading-practice.service';
import { validateReadingTopicForLevel } from './utils/validate-reading-params';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingPracticeController {
  constructor(private readonly readingPracticeService: ReadingPracticeService) {}

  @Get(':level/:topic')
  async getPassage(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetReadingPassageDto,
  ) {
    validateReadingTopicForLevel(params.level, params.topic);

    const result = await this.readingPracticeService.getPassage(
      user.sub,
      params.level,
      params.topic,
    );

    return successResponse(result);
  }

  @Post('submit')
  async submitAnswer(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitReadingAnswerDto,
  ) {
    validateReadingTopicForLevel(dto.level, dto.topic);

    const result = await this.readingPracticeService.submitAnswer(
      user.sub,
      dto.passageId,
      dto.answers.map((item) => ({
        questionId: item.questionId,
        userAnswer: item.userAnswer,
      })),
      dto.level,
      dto.topic,
    );

    const payload = result.results.map((item) => ({
      questionId: item.questionId,
      is_correct: item.isCorrect,
      correct_answer: item.correctAnswer,
      explanation: item.explanation,
      error_pattern: item.errorPattern ?? null,
      ...mapEnrichedFeedbackToApi(item),
    }));

    return successResponse({
      results: payload,
      passage_complete: result.passageComplete,
      xp_earned: result.xpEarned ?? 0,
      streak: result.streak ?? 0,
      difficultyLevel: result.difficultyLevel ?? 1,
      error_patterns: result.error_patterns ?? [],
    });
  }
}
