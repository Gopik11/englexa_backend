import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { TutorFeedbackRequestDto } from './dto/tutor-feedback.dto';
import { TutorFeedbackService } from './tutor-feedback.service';

@Controller('tutor')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorFeedbackService: TutorFeedbackService) {}

  @Post('feedback')
  feedback(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: TutorFeedbackRequestDto,
  ) {
    const result = this.tutorFeedbackService.generateTutorFeedback({
      userSentence: dto.sentence,
      userId: user.sub,
      level: dto.level,
    });

    return successResponse(result);
  }
}
