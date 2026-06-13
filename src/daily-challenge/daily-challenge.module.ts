import { Module } from '@nestjs/common';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { MasteryModule } from '../mastery/mastery.module';
import { PredictionModule } from '../prediction/prediction.module';
import { ProfileModule } from '../profile/profile.module';
import { SrsModule } from '../srs/srs.module';
import { DailyChallengeController } from './daily-challenge.controller';
import { DailyChallengeService } from './daily-challenge.service';

@Module({
  imports: [MasteryModule, ErrorPatternsModule, SrsModule, PredictionModule, ProfileModule],
  controllers: [DailyChallengeController],
  providers: [DailyChallengeService],
  exports: [DailyChallengeService],
})
export class DailyChallengeModule {}
