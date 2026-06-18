import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import {
  CompleteLessonDto,
  GenerateLessonDto,
  MiniLessonModule,
} from './entities/mini-lesson.entity';
import { MiniLessonsService } from './mini-lessons.service';

@Controller('mini-lessons')
@UseGuards(JwtAuthGuard)
export class MiniLessonsController {
  constructor(private readonly miniLessonsService: MiniLessonsService) {}

  @Get('concept/:concept')
  getByConcept(
    @Param('concept') concept: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const parsed = difficulty ? Number.parseInt(difficulty, 10) : 2;
    const lesson = this.miniLessonsService.getLessonByConcept(
      concept,
      Number.isFinite(parsed) ? parsed : 2,
    );
    return normalizeResponse(lesson);
  }

  @Get('weak-areas/:userId')
  async getWeakAreas(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.miniLessonsService.assertUserAccess(userId, user.sub);
    const lessons = await this.miniLessonsService.getLessonsForWeakAreas(userId);
    return normalizeResponse({ lessons });
  }

  @Get('random/:module')
  async getRandom(
    @Param('module') module: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    const lesson = await this.miniLessonsService.getRandomLesson(
      module as MiniLessonModule,
      user.sub,
    );
    return normalizeResponse(lesson);
  }

  @Get('featured')
  async getFeatured(@CurrentUser() user: AuthJwtPayload) {
    const lesson = await this.miniLessonsService.getFeaturedLesson(user.sub);
    return normalizeResponse(lesson);
  }

  @Post('generate')
  generate(@Body() body: GenerateLessonDto) {
    const lesson = this.miniLessonsService.generateLessonFromDto(body);
    return normalizeResponse(lesson);
  }

  @Post('complete')
  async complete(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: CompleteLessonDto,
  ) {
    const result = await this.miniLessonsService.markLessonCompleted(
      user.sub,
      body,
    );
    return normalizeResponse(result);
  }
}

