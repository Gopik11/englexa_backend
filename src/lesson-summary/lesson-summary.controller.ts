import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { LessonSummaryService } from './lesson-summary.service';
import { SummaryModule } from './utils/summary-generator';

class GenerateLessonSummaryDto {
  module!: SummaryModule;
  session_data!: Record<string, unknown>;
}

@Controller('lesson-summary')
@UseGuards(JwtAuthGuard)
export class LessonSummaryController {
  constructor(private readonly lessonSummaryService: LessonSummaryService) {}

  @Post('generate')
  async generate(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: GenerateLessonSummaryDto,
  ) {
    const summary = await this.lessonSummaryService.generate(user.sub, {
      module: body.module,
      session_data: body.session_data ?? {},
    });
    return normalizeResponse(summary);
  }
}

