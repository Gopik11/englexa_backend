import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { GetVocabExercisesDto } from './dto/get-vocab-exercises.dto';
import { SubmitVocabAnswerDto } from './dto/submit-vocab-answer.dto';
import { VocabularyPracticeService } from './vocabulary-practice.service';
import { validateVocabTopicForLevel } from './utils/validate-vocab-params';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyPracticeController {
  constructor(
    private readonly vocabularyPracticeService: VocabularyPracticeService,
  ) {}

  @Get(':level/:topic')
  async getExercises(
    @CurrentUser() user: AuthJwtPayload,
    @Param() params: GetVocabExercisesDto,
  ) {
    validateVocabTopicForLevel(params.level, params.topic);

    const result = await this.vocabularyPracticeService.getExercises(
      user.sub,
      params.level,
      params.topic,
    );

    return successResponse(result);
  }

  @Post('submit')
  async submitAnswer(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: SubmitVocabAnswerDto,
  ) {
    validateVocabTopicForLevel(dto.level, dto.topic);

    const result = await this.vocabularyPracticeService.submitAnswer(
      user.sub,
      dto.exerciseId,
      dto.userAnswer,
      dto.level,
      dto.topic,
    );

    return successResponse({
      is_correct: result.isCorrect,
      correct_answer: result.correctAnswer,
      explanation: result.explanation,
      example_sentence: result.exampleSentence,
      micro_lesson: result.microLesson,
      xp_earned: result.xpEarned ?? 0,
      streak: result.streak ?? 0,
      difficultyLevel: result.difficultyLevel ?? 1,
      errorPattern: result.errorPattern ?? null,
      ...mapEnrichedFeedbackToApi(result),
    });
  }
}
