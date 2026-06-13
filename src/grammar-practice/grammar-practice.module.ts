import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { AiModule } from '../ai/ai.module';
import { GamificationModule } from '../gamification/gamification.module';
import { ProgressModule } from '../progress/progress.module';
import { GrammarPracticeController } from './grammar-practice.controller';
import { GrammarPracticeService } from './grammar-practice.service';
import { AiExerciseGenerator } from './utils/ai-exercise-generator';

@Module({
  imports: [
    AdaptiveModule,
    ErrorPatternsModule,
    AiModule,
    GamificationModule,
    ProgressModule,
  ],
  controllers: [GrammarPracticeController],
  providers: [GrammarPracticeService, AiExerciseGenerator],
  exports: [GrammarPracticeService],
})
export class GrammarPracticeModule {}