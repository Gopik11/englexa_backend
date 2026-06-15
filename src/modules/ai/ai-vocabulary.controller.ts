import { Controller, Get } from '@nestjs/common';
import { successResponse } from '../../common/dto/api-response.dto';
import { AiVocabularyService } from './ai-vocabulary.service';

@Controller('ai')
export class AiVocabularyController {
  constructor(private readonly vocabularyService: AiVocabularyService) {}

  @Get('vocabulary')
  getVocabulary() {
    return successResponse(this.vocabularyService.getVocabulary());
  }
}
