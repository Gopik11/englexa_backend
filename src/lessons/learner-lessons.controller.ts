import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LearnerLessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthJwtPayload,
    @Query() query: LessonQueryDto,
  ) {
    const lessons = await this.lessonsService.findPublishedForUser(
      user.sub,
      query,
    );
    return normalizeResponse(lessons);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthJwtPayload,
    @Param('id') id: string,
  ) {
    const lesson = await this.lessonsService.findPublishedDetailForUser(
      id,
      user.sub,
    );
    return normalizeResponse(lesson);
  }
}

