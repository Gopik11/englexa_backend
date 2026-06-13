import { Module } from '@nestjs/common';

import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';

import { MasteryModule } from '../mastery/mastery.module';

import { LessonSummaryController } from './lesson-summary.controller';

import { LessonSummaryService } from './lesson-summary.service';



@Module({

  imports: [ErrorPatternsModule, MasteryModule],

  controllers: [LessonSummaryController],

  providers: [LessonSummaryService],

  exports: [LessonSummaryService],

})

export class LessonSummaryModule {}


