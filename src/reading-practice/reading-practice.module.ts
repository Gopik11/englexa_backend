import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MasteryModule } from '../mastery/mastery.module';
import { ReadingPracticeController } from './reading-practice.controller';
import { ReadingPracticeService } from './reading-practice.service';
import { AiReadingGenerator } from './utils/ai-reading-generator';

@Module({
  imports: [AdaptiveModule, ErrorPatternsModule, GamificationModule, MasteryModule],
  controllers: [ReadingPracticeController],
  providers: [ReadingPracticeService, AiReadingGenerator],
  exports: [ReadingPracticeService],
})
export class ReadingPracticeModule {}
