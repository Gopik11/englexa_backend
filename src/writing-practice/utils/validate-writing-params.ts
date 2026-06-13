import { BadRequestException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WRITING_TOPICS_BY_LEVEL } from '../../content/writing-topics.constants';
import { WritingTopic } from '../interfaces/writing-prompt.interface';

export function validateWritingTopicForLevel(
  level: LearnerLevel,
  topic: WritingTopic,
): void {
  const allowed = WRITING_TOPICS_BY_LEVEL[level];
  if (!allowed.includes(topic)) {
    throw new BadRequestException(
      `Topic "${topic}" is not valid for level "${level}"`,
    );
  }
}
