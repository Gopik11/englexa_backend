import { LearnerLevel } from './englexa-content-spec.constants';
import { GrammarTopic } from '../grammar-practice/interfaces/grammar-exercise.interface';

export const GRAMMAR_TOPICS_BY_LEVEL: Record<LearnerLevel, GrammarTopic[]> = {
  beginner: [
    'articles',
    'simple_present',
    'simple_past',
    'prepositions',
    'subject_verb',
    'basic_structure',
  ],
  intermediate: [
    'present_vs_continuous',
    'past_vs_continuous',
    'countable_uncountable',
    'comparatives',
    'modals',
    'adverbs',
  ],
  advanced: [
    'conditionals',
    'relative_clauses',
    'passive_voice',
    'reported_speech',
    'perfect_tenses',
    'connectors',
  ],
};

export const ALL_GRAMMAR_TOPICS: GrammarTopic[] = [
  ...GRAMMAR_TOPICS_BY_LEVEL.beginner,
  ...GRAMMAR_TOPICS_BY_LEVEL.intermediate,
  ...GRAMMAR_TOPICS_BY_LEVEL.advanced,
];
