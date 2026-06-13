import { LearnerLevel } from './englexa-content-spec.constants';
import { SpeakingTopic } from '../speaking-practice/interfaces/speaking-prompt.interface';

export const SPEAKING_TOPICS_BY_LEVEL: Record<LearnerLevel, SpeakingTopic[]> = {
  beginner: ['self_introduction', 'daily_routines'],
  intermediate: ['travel_stories', 'opinions'],
  advanced: ['presentations', 'debates'],
};

export const ALL_SPEAKING_TOPICS: SpeakingTopic[] = [
  ...SPEAKING_TOPICS_BY_LEVEL.beginner,
  ...SPEAKING_TOPICS_BY_LEVEL.intermediate,
  ...SPEAKING_TOPICS_BY_LEVEL.advanced,
];
