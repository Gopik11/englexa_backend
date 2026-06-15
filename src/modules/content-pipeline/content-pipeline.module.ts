import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaGrammarDraftRepository } from '../grammar/repositories/prisma-grammar-draft.repository';
import { PrismaGrammarHistoryRepository } from '../grammar/repositories/prisma-grammar-history.repository';
import { PrismaGrammarTopicRepository } from '../grammar/repositories/prisma-grammar-topic.repository';
import { GrammarContentGeneratorService } from './grammar-content-generator.service';
import { AiContentProviderService } from './providers/ai-content-provider.service';
import { LlmAiContentProvider } from './providers/llm-ai-content.provider';
import { ContentPipelineService } from './services/content-pipeline.service';
import { ContentPublishingService } from './services/content-publishing.service';
import { ContentValidationService } from './services/content-validation.service';
import { ContentVersioningService } from './services/content-versioning.service';
import { AI_CONTENT_PROVIDER } from '../core/ai-content-provider.interface';

@Module({
  imports: [PrismaModule],
  providers: [
    AiContentProviderService,
    LlmAiContentProvider,
    { provide: AI_CONTENT_PROVIDER, useExisting: AiContentProviderService },
    ContentValidationService,
    ContentVersioningService,
    ContentPublishingService,
    ContentPipelineService,
    GrammarContentGeneratorService,
    PrismaGrammarDraftRepository,
    PrismaGrammarHistoryRepository,
    PrismaGrammarTopicRepository,
  ],
  exports: [
    ContentPipelineService,
    ContentPublishingService,
    ContentValidationService,
    ContentVersioningService,
    GrammarContentGeneratorService,
    AiContentProviderService,
    AI_CONTENT_PROVIDER,
    PrismaGrammarDraftRepository,
    PrismaGrammarHistoryRepository,
  ],
})
export class ContentPipelineModule {}
