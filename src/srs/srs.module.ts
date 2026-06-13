import { Module } from '@nestjs/common';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { MasteryModule } from '../mastery/mastery.module';
import { ProfileModule } from '../profile/profile.module';
import { SrsController } from './srs.controller';
import { SrsService } from './srs.service';

@Module({
  imports: [MasteryModule, ErrorPatternsModule, ProfileModule],
  controllers: [SrsController],
  providers: [SrsService],
  exports: [SrsService],
})
export class SrsModule {}
