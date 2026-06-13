import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';

@Module({
  imports: [AiModule, GamificationModule],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
