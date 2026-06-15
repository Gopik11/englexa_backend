import { Module } from '@nestjs/common';
import { AiSpeakingController } from './ai-speaking.controller';
import { AiSpeakingService } from './ai-speaking.service';
import { AiVocabularyController } from './ai-vocabulary.controller';
import { AiVocabularyService } from './ai-vocabulary.service';

@Module({
  controllers: [AiVocabularyController, AiSpeakingController],
  providers: [AiVocabularyService, AiSpeakingService],
})
export class AiModule {}
