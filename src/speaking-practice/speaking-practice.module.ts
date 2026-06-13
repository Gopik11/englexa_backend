import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { AiModule } from '../ai/ai.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MasteryModule } from '../mastery/mastery.module';
import { ProfileModule } from '../profile/profile.module';
import { SpeakingPracticeController } from './speaking-practice.controller';
import { SpeakingPracticeService } from './speaking-practice.service';
import { AiSpeakingPromptGenerator } from './utils/ai-speaking-prompt-generator';
import { SpeakingEvaluator } from './utils/speaking-evaluator';

@Module({
  imports: [
    AdaptiveModule,
    ErrorPatternsModule,
    AiModule,
    GamificationModule,
    MasteryModule,
    ProfileModule,
  ],
  controllers: [SpeakingPracticeController],
  providers: [
    SpeakingPracticeService,
    AiSpeakingPromptGenerator,
    SpeakingEvaluator,
  ],
  exports: [SpeakingPracticeService],
})
export class SpeakingPracticeModule {}
