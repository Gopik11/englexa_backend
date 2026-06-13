import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { ConversationService } from './conversation.service';

class SendMessageDto {
  sessionId!: string;
  text?: string;
  audioBlobRef?: string;
  audioUrl?: string;
}

class EndSessionDto {
  sessionId!: string;
}

@Controller('conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('start')
  async start(@CurrentUser() user: AuthJwtPayload) {
    const session = await this.conversationService.startSession(user.sub);
    return successResponse(session);
  }

  @Post('send')
  async send(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: SendMessageDto,
  ) {
    const result = await this.conversationService.sendMessage(user.sub, body);
    return successResponse(result);
  }

  @Post('end')
  async end(
    @CurrentUser() user: AuthJwtPayload,
    @Body() body: EndSessionDto,
  ) {
    const session = await this.conversationService.endSession(
      user.sub,
      body.sessionId,
    );
    return successResponse(session);
  }

  @Get('session/:id')
  async getSession(
    @CurrentUser() user: AuthJwtPayload,
    @Param('id') id: string,
  ) {
    const session = await this.conversationService.getSession(user.sub, id);
    return successResponse(session);
  }
}
