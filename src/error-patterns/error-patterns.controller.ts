import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { ErrorPatternsService } from './error-patterns.service';
import { ErrorPatternModule } from './entities/error-pattern.entity';

class DetectErrorDto {
  userAnswer!: string;
  correctAnswer!: string;
  module!: ErrorPatternModule;
  concept?: string;
  topic?: string;
}

class RecordErrorDto extends DetectErrorDto {}

@Controller('error-patterns')
@UseGuards(JwtAuthGuard)
export class ErrorPatternsController {
  constructor(private readonly errorPatternsService: ErrorPatternsService) {}

  @Post('detect')
  async detect(@Body() body: DetectErrorDto) {
    const pattern = this.errorPatternsService.detectErrorPattern(body);
    return successResponse(pattern);
  }

  @Post('record')
  async record(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: RecordErrorDto,
  ) {
    const detected = this.errorPatternsService.detectErrorPattern(body);
    const stored = await this.errorPatternsService.recordErrorPattern(
      user.sub,
      detected,
      body.userAnswer,
    );
    return successResponse(stored);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthJwtPayload) {
    const profile = await this.errorPatternsService.getErrorProfile(user.sub);
    return successResponse(profile);
  }

  @Get('top')
  async getTop(
    @CurrentUser() user: AuthJwtPayload,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 10;
    const patterns = await this.errorPatternsService.getTopErrorPatterns(
      user.sub,
      Number.isFinite(parsedLimit) ? parsedLimit : 10,
    );
    return successResponse({ patterns });
  }
}
