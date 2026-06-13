import { Module } from '@nestjs/common';
import { ErrorPatternsController } from './error-patterns.controller';
import { ErrorPatternsService } from './error-patterns.service';

@Module({
  controllers: [ErrorPatternsController],
  providers: [ErrorPatternsService],
  exports: [ErrorPatternsService],
})
export class ErrorPatternsModule {}
