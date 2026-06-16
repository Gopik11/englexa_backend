import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { AskQuestionDto } from './dto/ask-question.dto';
import { PracticeDto } from './dto/practice.dto';
import { VoiceInputDto } from './dto/voice-input.dto';
import { SpokenEnglishService } from './spoken-english.service';

@Controller('spoken-english')
@UseGuards(JwtAuthGuard)
export class SpokenEnglishController {
  constructor(private readonly spokenEnglishService: SpokenEnglishService) {}

  @Post('ask')
  async askQuestion(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: AskQuestionDto,
  ) {
    const result = await this.spokenEnglishService.askQuestion(user.sub, dto);
    return successResponse({
      english: result.english,
      local: result.local,
      audioBase64: result.audioBase64,
      confidenceTip: result.confidenceTip,
      detectedLanguage: result.detectedLanguage,
      translatedQuestion: result.translatedQuestion,
    });
  }

  @Post('voice')
  async processVoice(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: VoiceInputDto,
  ) {
    const result = await this.spokenEnglishService.processVoiceInput(
      user.sub,
      dto,
    );
    return successResponse({
      transcribedText: result.transcribedText,
      english: result.english,
      local: result.local,
      audioBase64: result.audioBase64,
      confidenceTip: result.confidenceTip,
      detectedLanguage: result.detectedLanguage,
      translatedQuestion: result.translatedQuestion,
      confidenceScore: result.confidenceScore,
      feedback: result.feedback,
      encouragement: result.encouragement,
    });
  }

  @Post('practice')
  async practice(
    @CurrentUser() user: AuthJwtPayload,
    @Body() dto: PracticeDto,
  ) {
    const result = await this.spokenEnglishService.practice(user.sub, dto);
    return successResponse({
      promptId: result.promptId,
      prompt: result.prompt,
      exampleAnswer: result.exampleAnswer,
      userResponse: result.userResponse,
      grammarScore: result.grammarScore,
      pronunciationScore: result.pronunciationScore,
      fluencyScore: result.fluencyScore,
      confidenceScore: result.confidenceScore,
      feedback: result.feedback,
      encouragement: result.encouragement,
      grammarFeedback: result.grammarFeedback,
      pronunciationFeedback: result.pronunciationFeedback,
      overallFeedback: result.overallFeedback,
      suggestedImprovement: result.suggestedImprovement,
      confidenceTip: result.confidenceTip,
      localFeedback: result.localFeedback,
      audioBase64: result.audioBase64,
    });
  }
}
