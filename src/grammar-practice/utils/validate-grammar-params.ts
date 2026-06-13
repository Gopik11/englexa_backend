import { BadRequestException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { GRAMMAR_TOPICS_BY_LEVEL } from '../../content/grammar-topics.constants';
import { GrammarTopic } from '../interfaces/grammar-exercise.interface';

export function validateTopicForLevel(
  level: LearnerLevel,
  topic: GrammarTopic,
): void {
  const allowed = GRAMMAR_TOPICS_BY_LEVEL[level];
  if (!allowed.includes(topic)) {
    throw new BadRequestException(
      `Topic "${topic}" is not valid for level "${level}"`,
    );
  }
}
