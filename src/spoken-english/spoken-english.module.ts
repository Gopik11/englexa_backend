import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentPipelineModule } from '../modules/content-pipeline/content-pipeline.module';
import { ConfidenceController } from './confidence/confidence.controller';
import { ConfidenceRepository } from './confidence/confidence.repository';
import { ConfidenceService } from './confidence/confidence.service';
import { SpokenEnglishController } from './spoken-english.controller';
import { SpokenEnglishService } from './spoken-english.service';

@Module({
  imports: [ContentPipelineModule, PrismaModule],
  controllers: [SpokenEnglishController, ConfidenceController],
  providers: [
    SpokenEnglishService,
    ConfidenceService,
    ConfidenceRepository,
  ],
  exports: [SpokenEnglishService, ConfidenceService],
})
export class SpokenEnglishModule {}
