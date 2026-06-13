import { BadRequestException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { SPEAKING_TOPICS_BY_LEVEL } from '../../content/speaking-topics.constants';
import { SpeakingTopic } from '../interfaces/speaking-prompt.interface';

export function validateSpeakingTopicForLevel(
  level: LearnerLevel,
  topic: SpeakingTopic,
): void {
  const allowed = SPEAKING_TOPICS_BY_LEVEL[level];
  if (!allowed.includes(topic)) {
    throw new BadRequestException(
      `Topic "${topic}" is not valid for level "${level}"`,
    );
  }
}
