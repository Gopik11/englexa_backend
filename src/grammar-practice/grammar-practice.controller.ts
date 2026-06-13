import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { GetExercisesDto } from './dto/get-exercises.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GrammarPracticeService } from './grammar-practice.service';
import { validateTopicForLevel } from './utils/validate-grammar-params';

@Controller('grammar')
@UseGuards(JwtAuthGuard)
export class GrammarPracticeController {
  constructor(private readonly grammarPracticeService: GrammarPracticeService) {}

  @Get(':level/:topic')
  async getExercises(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetExercisesDto,
  ) {
    validateTopicForLevel(params.level, params.topic);

    const result = await this.grammarPracticeService.getExercises(
      user.sub,
      params.level,
      params.topic,
    );

    return successResponse(result);
  }

  @Post('submit')
  async submitAnswer(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitAnswerDto,
  ) {
    validateTopicForLevel(dto.level, dto.topic);

    const result = await this.grammarPracticeService.submitAnswer(
      user.sub,
      dto.exerciseId,
      dto.userAnswer,
      dto.level,
      dto.topic,
    );

    return successResponse({
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      normalizedUserAnswer: result.normalizedUserAnswer,
      normalizedCorrectAnswer: result.normalizedCorrectAnswer,
      explanation: result.explanation,
      effectiveLevel: result.effectiveLevel,
      difficultyLevel: result.difficultyLevel,
      errorPattern: result.errorPattern ?? null,
      topicMistakeCount: result.topicMistakeCount,
      xpEarned: result.xpEarned,
      currentStreak: result.currentStreak,
      conceptMastery: result.grammarProgress?.mastery ?? null,
      ...mapEnrichedFeedbackToApi(result.feedback),
    });
  }
}
