import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GrammarProgressService } from '../services/grammar-progress.service';

@Controller('grammar')
@UseGuards(JwtAuthGuard)
export class GrammarProgressController {
  constructor(private readonly progressService: GrammarProgressService) {}

  @Get('progress')
  getProgress() {
    return successResponse(this.progressService.getProgress('stub-user'));
  }

  @Post('progress')
  updateProgress(@Body() body: Record<string, unknown>) {
    const userId = typeof body.userId === 'string' ? body.userId : 'stub-user';
    this.progressService.updateProgress(userId, body);
    return {
      success: true,
      message: 'Progress updated (Phase 1 stub)',
    };
  }
}
