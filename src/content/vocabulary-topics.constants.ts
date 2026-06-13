import { LearnerLevel } from './englexa-content-spec.constants';
import { VocabTopic } from '../vocabulary-practice/interfaces/vocab-exercise.interface';

export const VOCAB_TOPICS_BY_LEVEL: Record<LearnerLevel, VocabTopic[]> = {
  beginner: [
    'common_nouns',
    'common_verbs',
    'adjectives',
    'everyday_phrases',
  ],
  intermediate: [
    'phrasal_verbs',
    'collocations',
    'synonyms_antonyms',
    'topic_travel',
  ],
  advanced: [
    'idioms',
    'academic_words',
    'topic_business',
    'topic_technology',
  ],
};

export const ALL_VOCAB_TOPICS: VocabTopic[] = [
  ...VOCAB_TOPICS_BY_LEVEL.beginner,
  ...VOCAB_TOPICS_BY_LEVEL.intermediate,
  ...VOCAB_TOPICS_BY_LEVEL.advanced,
];
