import { Module } from '@nestjs/common';
import { ErrorPatternsModule } from '../error-patterns/error-patterns.module';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';

@Module({
  imports: [ErrorPatternsModule],
  controllers: [MasteryController],
  providers: [MasteryService],
  exports: [MasteryService],
})
export class MasteryModule {}
