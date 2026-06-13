import { Module } from '@nestjs/common';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { MasteryModule } from '../mastery/mastery.module';
import { ProfileModule } from '../profile/profile.module';
import { MiniLessonsController } from './mini-lessons.controller';
import { MiniLessonsService } from './mini-lessons.service';

@Module({
  imports: [MasteryModule, ErrorPatternsModule, ProfileModule],
  controllers: [MiniLessonsController],
  providers: [MiniLessonsService],
  exports: [MiniLessonsService],
})
export class MiniLessonsModule {}
