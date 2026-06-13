import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { AiService } from './ai.service';
import { PronunciationRequestDto } from './dto/pronunciation.dto';
import { TutorRequestDto } from './dto/tutor.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('tutor')
  async tutor(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: TutorRequestDto,
  ) {
    const result = await this.aiService.tutor(user.sub, dto);
    return successResponse(result);
  }

  @Post('pronunciation')
  async pronunciation(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: PronunciationRequestDto,
  ) {
    const result = await this.aiService.pronunciation(user.sub, dto);
    return successResponse(result);
  }
}
