import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ContentValidationService {
  validateTopic(content: Record<string, unknown>) {
    if (!content.slug || typeof content.slug !== 'string') {
      throw new BadRequestException('Topic slug is required');
    }
    if (!content.name || typeof content.name !== 'string') {
      throw new BadRequestException('Topic name is required');
    }
    return true;
  }

  validateExercise(content: Record<string, unknown>) {
    if (!content.question || typeof content.question !== 'string') {
      throw new BadRequestException('Exercise question is required');
    }
    return true;
  }

  validateExample(content: Record<string, unknown>) {
    if (!content.sentence || typeof content.sentence !== 'string') {
      throw new BadRequestException('Example sentence is required');
    }
    return true;
  }

  validateVocabulary(content: Record<string, unknown>) {
    if (!Array.isArray(content.exercises) || content.exercises.length === 0) {
      throw new BadRequestException('At least one vocabulary exercise is required');
    }
    return true;
  }

  validateSpeaking(content: Record<string, unknown>) {
    if (!content.reply || typeof content.reply !== 'string') {
      throw new BadRequestException('Speaking reply is required');
    }
    if (!content.sessionId || typeof content.sessionId !== 'string') {
      throw new BadRequestException('Speaking sessionId is required');
    }
    return true;
  }
}
