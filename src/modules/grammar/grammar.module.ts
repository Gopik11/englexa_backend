import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ContentPipelineModule } from '../content-pipeline/content-pipeline.module';
import {
  ExercisesAliasController,
  GrammarCatalogController,
} from './controllers/grammar-catalog.controller';
import { GrammarProgressController } from './controllers/grammar-progress.controller';
import { PrismaGrammarExampleRepository } from './repositories/prisma-grammar-example.repository';
import { PrismaGrammarExerciseRepository } from './repositories/prisma-grammar-exercise.repository';
import { PrismaGrammarTopicRepository } from './repositories/prisma-grammar-topic.repository';
import { PrismaUserGrammarProgressRepository } from './repositories/prisma-user-grammar-progress.repository';
import { PrismaGrammarDraftRepository } from './repositories/prisma-grammar-draft.repository';
import { PrismaGrammarHistoryRepository } from './repositories/prisma-grammar-history.repository';
import { AdaptiveDifficultyService } from './services/adaptive-difficulty.service';
import { GrammarContentService } from './services/grammar-content.service';
import { GrammarProgressService } from './services/grammar-progress.service';

@Module({
  imports: [PrismaModule, ContentPipelineModule],
  controllers: [
    GrammarCatalogController,
    ExercisesAliasController,
    GrammarProgressController,
  ],
  providers: [
    PrismaGrammarTopicRepository,
    PrismaGrammarExerciseRepository,
    PrismaGrammarExampleRepository,
    PrismaUserGrammarProgressRepository,
    PrismaGrammarDraftRepository,
    PrismaGrammarHistoryRepository,
    AdaptiveDifficultyService,
    GrammarContentService,
    GrammarProgressService,
  ],
  exports: [GrammarContentService, GrammarProgressService, AdaptiveDifficultyService],
})
export class GrammarModule {}
