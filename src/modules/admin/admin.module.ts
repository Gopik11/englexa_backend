import { Module } from '@nestjs/common';
import { ContentPipelineModule } from '../content-pipeline/content-pipeline.module';
import { GrammarAdminController } from './controllers/grammar-admin.controller';

@Module({
  imports: [ContentPipelineModule],
  controllers: [GrammarAdminController],
})
export class AdminModule {}
