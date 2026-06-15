import { Injectable } from '@nestjs/common';

@Injectable()
export class AiVocabularyService {
  getVocabulary() {
    return {
      mode: 'vocabulary-practice',
      words: ['apple', 'run', 'beautiful'],
      message: 'Stub vocabulary response (Phase 1)',
    };
  }
}
