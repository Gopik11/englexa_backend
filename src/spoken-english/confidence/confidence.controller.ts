import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/dto/api-response.dto';
import { ConfidenceService } from './confidence.service';
import { RecordConfidenceDto } from './dto/record-confidence.dto';

@Controller('spoken-english/confidence')
@UseGuards(JwtAuthGuard)
export class ConfidenceController {
  constructor(private readonly confidenceService: ConfidenceService) {}

  @Post('record')
  async recordConfidence(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: RecordConfidenceDto,
  ) {
    const result = await this.confidenceService.recordConfidence(user.sub, dto);
    return successResponse(result);
  }

  @Get('history')
  async getHistory(@CurrentUser() user: AuthJwtPayload) {
    const history = await this.confidenceService.getHistory(user.sub);
    return successResponse({ history });
  }
}
