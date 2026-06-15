import { Body, Controller, Post } from '@nestjs/common';
import { successResponse } from '../../common/dto/api-response.dto';
import { AiSpeakingService } from './ai-speaking.service';

@Controller('ai')
export class AiSpeakingController {
  constructor(private readonly speakingService: AiSpeakingService) {}

  @Post('speaking')
  processSpeaking(@Body() body: { userId?: string; message?: string }) {
    return successResponse(this.speakingService.processMessage(body));
  }
}
