import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { PredictionService } from './prediction.service';

@Controller('prediction')
@UseGuards(JwtAuthGuard)
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('concept/:userId/:module/:concept')
  async predictConcept(
    @Param('userId') userId: string,
    @Param('module') module: string,
    @Param('concept') concept: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.predictionService.assertUserAccess(userId, user.sub);
    const prediction = await this.predictionService.predictForConcept(
      userId,
      module,
      concept,
    );
    return successResponse(prediction);
  }

  @Get('module/:userId/:module')
  async predictModule(
    @Param('userId') userId: string,
    @Param('module') module: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.predictionService.assertUserAccess(userId, user.sub);
    const predictions = await this.predictionService.predictForModule(
      userId,
      module,
    );
    return successResponse({ predictions });
  }

  @Get('all/:userId')
  async predictAll(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.predictionService.assertUserAccess(userId, user.sub);
    const predictions = await this.predictionService.predictForAll(userId);
    return successResponse({ predictions });
  }

  @Get('recommendations/:userId')
  async getRecommendations(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthJwtPayload,
  ) {
    await this.predictionService.assertUserAccess(userId, user.sub);
    const recommendations =
      await this.predictionService.getRecommendations(userId);
    return successResponse(recommendations);
  }
}
