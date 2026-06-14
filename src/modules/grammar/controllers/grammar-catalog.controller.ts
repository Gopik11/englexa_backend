import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../../../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GrammarContentService } from '../services/grammar-content.service';
import { GrammarProgressService } from '../services/grammar-progress.service';

@Controller('grammar')
@UseGuards(JwtAuthGuard)
export class GrammarCatalogController {
  constructor(
    private readonly contentService: GrammarContentService,
    private readonly progressService: GrammarProgressService,
  ) {}

  @Get('topics')
  async getTopics() {
    return successResponse(await this.contentService.listTopicsByLevel());
  }

  @Get('exercises')
  async getExercises(
    @Query('level') level?: string,
    @Query('topicId') topicId?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const parsedDifficulty = difficulty != null ? Number(difficulty) : undefined;
    return successResponse(
      await this.contentService.listExercises({
        level,
        topicId,
        topic,
        difficulty: Number.isFinite(parsedDifficulty) ? parsedDifficulty : undefined,
      }),
    );
  }

  @Get('examples')
  async getExamples(@Query('topicId') topicId?: string) {
    return successResponse(await this.contentService.listExamples(topicId ?? ''));
  }

  @Get('progress')
  async getProgress(@CurrentUser() user: AuthJwtPayload) {
    return successResponse(await this.progressService.getUserProgress(user.sub));
  }

  @Post('progress')
  async postProgress(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: { topicId?: string; score?: number },
  ) {
    return successResponse(
      await this.progressService.recordProgress(user.sub, body.topicId ?? '', {
        score: body.score,
      }),
    );
  }
}

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesAliasController {
  constructor(private readonly contentService: GrammarContentService) {}

  @Get()
  async getExercises(
    @Query('level') level?: string,
    @Query('topicId') topicId?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const parsedDifficulty = difficulty != null ? Number(difficulty) : undefined;
    return successResponse(
      await this.contentService.listExercises({
        level,
        topicId,
        topic,
        difficulty: Number.isFinite(parsedDifficulty) ? parsedDifficulty : undefined,
      }),
    );
  }
}
