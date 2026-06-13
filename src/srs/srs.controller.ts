import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { RecordReviewDto } from './entities/srs.entity';
import { SrsService } from './srs.service';

@Controller('srs')
@UseGuards(JwtAuthGuard)
export class SrsController {
  constructor(private readonly srsService: SrsService) {}

  @Post('review')
  async recordReview(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: RecordReviewDto,
  ) {
    const item = await this.srsService.recordReview(user.sub, body);
    return successResponse(item);
  }

  @Get('due/:userId')
  async getDue(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.srsService.assertUserAccess(userId, user.sub);
    const items = await this.srsService.getDueReviews(userId);
    return successResponse({ items });
  }

  @Get('status/:userId')
  async getStatus(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.srsService.assertUserAccess(userId, user.sub);
    const status = await this.srsService.getSrsStatus(userId);
    return successResponse(status);
  }
}
