import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { AiModule } from '../ai/ai.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MasteryModule } from '../mastery/mastery.module';
import { WritingPracticeController } from './writing-practice.controller';
import { WritingPracticeService } from './writing-practice.service';
import { AiWritingPromptGenerator } from './utils/ai-writing-prompt-generator';
import { WritingEvaluator } from './utils/writing-evaluator';

@Module({
  imports: [
    AdaptiveModule,
    ErrorPatternsModule,
    AiModule,
    GamificationModule,
    MasteryModule,
  ],
  controllers: [WritingPracticeController],
  providers: [
    WritingPracticeService,
    AiWritingPromptGenerator,
    WritingEvaluator,
  ],
  exports: [WritingPracticeService],
})
export class WritingPracticeModule {}
