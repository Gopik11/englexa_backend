import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { mapEnrichedFeedbackToApi } from '../common/utils/enriched-feedback.mapper';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { GetReadingPassageDto } from './dto/get-reading-passage.dto';
import { SubmitReadingAnswerDto } from './dto/submit-reading-answer.dto';
import { ReadingPracticeService } from './reading-practice.service';
import { validateReadingTopicForLevel } from './utils/validate-reading-params';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingPracticeController {
  constructor(private readonly readingPracticeService: ReadingPracticeService) {}

  /** Lists available reading topics (alias for clients expecting /reading/questions). */
  @Get('questions')
  listQuestions(@Query('level') level?: LearnerLevel) {
    const topics = level
      ? this.readingPracticeService.listTopicsForLevel(level)
      : this.readingPracticeService.listTopics();

    return normalizeResponse({
      topics,
      questions: topics.map((topic) => ({
        topic,
        level: level ?? null,
        path: level ? `/reading/${level}/${topic}` : null,
      })),
    });
  }

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

    return normalizeResponse({
      passage: result.passage ?? {
        id: '',
        level: params.level,
        topic: params.topic,
        title: '',
        passage: '',
        questions: [],
      },
      effectiveLevel: result.effectiveLevel ?? params.level,
      difficultyLevel: result.difficultyLevel ?? 1,
      hasMore: result.hasMore ?? false,
      jsonRemaining: result.jsonRemaining ?? 0,
    });
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

    const payload = (result.results ?? []).map((item) => ({
      questionId: item.questionId ?? '',
      is_correct: item.isCorrect ?? false,
      correct_answer: item.correctAnswer ?? '',
      explanation: item.explanation ?? '',
      error_pattern: item.errorPattern ?? null,
      ...mapEnrichedFeedbackToApi(item),
    }));

    return normalizeResponse({
      results: payload,
      passage_complete: result.passageComplete ?? false,
      xp_earned: result.xpEarned ?? 0,
      streak: result.streak ?? 0,
      difficultyLevel: result.difficultyLevel ?? 1,
      error_patterns: result.error_patterns ?? [],
    });
  }
}

