import { Module } from '@nestjs/common';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { AiModule } from '../ai/ai.module';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { MasteryModule } from '../mastery/mastery.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationPronunciationEvaluator } from './utils/pronunciation-evaluator';

@Module({
  imports: [AiModule, MasteryModule, ErrorPatternsModule, AdaptiveModule],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationPronunciationEvaluator],
  exports: [ConversationService],
})
export class ConversationModule {}
