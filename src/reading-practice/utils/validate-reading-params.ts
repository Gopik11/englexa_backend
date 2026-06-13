import { BadRequestException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { READING_TOPICS_BY_LEVEL } from '../../content/reading-topics.constants';
import { ReadingTopic } from '../interfaces/reading-passage.interface';

export function validateReadingTopicForLevel(
  level: LearnerLevel,
  topic: ReadingTopic,
): void {
  const allowed = READING_TOPICS_BY_LEVEL[level];
  if (!allowed.includes(topic)) {
    throw new BadRequestException(
      `Topic "${topic}" is not valid for level "${level}"`,
    );
  }
}
