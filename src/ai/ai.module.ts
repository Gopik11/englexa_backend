import { Module } from '@nestjs/common';
import { CacheModule } from '../common/cache/cache.module';
import { GamificationModule } from '../gamification/gamification.module';
import { AiController } from './ai.controller';
import { TutorController } from './tutor.controller';
import { AiCacheService } from './ai-cache.service';
import { AiService } from './ai.service';import { AiUsageService } from './ai-usage.service';
import { AI_EVALUATION_SERVICE } from './interfaces/ai-evaluation.interface';
import { AI_PRONUNCIATION_SERVICE } from './interfaces/ai-pronunciation.interface';
import { AI_TUTOR_SERVICE } from './interfaces/ai-tutor.interface';
import { MockAiEvaluationService } from './mocks/mock-ai-evaluation.service';
import { MockAiPronunciationService } from './mocks/mock-ai-pronunciation.service';
import { MockAiTutorService } from './mocks/mock-ai-tutor.service';
import { TutorFeedbackService } from './tutor-feedback.service';

@Module({
  imports: [GamificationModule, CacheModule],  controllers: [AiController, TutorController],
  providers: [
    AiService,
    AiUsageService,
    AiCacheService,
    TutorFeedbackService,
    {
      provide: AI_TUTOR_SERVICE,
      useClass: MockAiTutorService,
    },
    {
      provide: AI_EVALUATION_SERVICE,
      useClass: MockAiEvaluationService,
    },
    {
      provide: AI_PRONUNCIATION_SERVICE,
      useClass: MockAiPronunciationService,
    },
  ],
  exports: [AI_TUTOR_SERVICE, AI_EVALUATION_SERVICE, AI_PRONUNCIATION_SERVICE, TutorFeedbackService],
})
export class AiModule {}
