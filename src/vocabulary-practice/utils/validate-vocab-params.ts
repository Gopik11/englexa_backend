import { BadRequestException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { VOCAB_TOPICS_BY_LEVEL } from '../../content/vocabulary-topics.constants';
import { VocabTopic } from '../interfaces/vocab-exercise.interface';

export function validateVocabTopicForLevel(
  level: LearnerLevel,
  topic: VocabTopic,
): void {
  const allowed = VOCAB_TOPICS_BY_LEVEL[level];
  if (!allowed.includes(topic)) {
    throw new BadRequestException(
      `Topic "${topic}" is not valid for level "${level}"`,
    );
  }
}
