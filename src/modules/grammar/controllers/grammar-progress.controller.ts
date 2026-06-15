import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GrammarProgressService } from '../services/grammar-progress.service';

@Controller('grammar')
export class GrammarProgressController {
  constructor(private readonly progressService: GrammarProgressService) {}

  @Public()
  @Get('progress')
  getProgress() {
    return successResponse(this.progressService.getProgress('stub-user'));
  }

  @Public()
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
