import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MasteryModule } from '../mastery/mastery.module';
import { VocabularyPracticeController } from './vocabulary-practice.controller';
import { VocabularyPracticeService } from './vocabulary-practice.service';
import { AiVocabGenerator } from './utils/ai-vocab-generator';

@Module({
  imports: [AdaptiveModule, ErrorPatternsModule, GamificationModule, MasteryModule],
  controllers: [VocabularyPracticeController],
  providers: [VocabularyPracticeService, AiVocabGenerator],
  exports: [VocabularyPracticeService],
})
export class VocabularyPracticeModule {}
