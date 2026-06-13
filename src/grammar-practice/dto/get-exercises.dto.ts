import { IsEnum } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { GrammarTopic } from '../interfaces/grammar-exercise.interface';

export enum GrammarLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum GrammarTopicParam {
  ARTICLES = 'articles',
  SIMPLE_PRESENT = 'simple_present',
  SIMPLE_PAST = 'simple_past',
  PREPOSITIONS = 'prepositions',
  SUBJECT_VERB = 'subject_verb',
  BASIC_STRUCTURE = 'basic_structure',
  PRESENT_VS_CONTINUOUS = 'present_vs_continuous',
  PAST_VS_CONTINUOUS = 'past_vs_continuous',
  COUNTABLE_UNCOUNTABLE = 'countable_uncountable',
  COMPARATIVES = 'comparatives',
  MODALS = 'modals',
  ADVERBS = 'adverbs',
  CONDITIONALS = 'conditionals',
  RELATIVE_CLAUSES = 'relative_clauses',
  PASSIVE_VOICE = 'passive_voice',
  REPORTED_SPEECH = 'reported_speech',
  PERFECT_TENSES = 'perfect_tenses',
  CONNECTORS = 'connectors',
}

/** Path params for GET /grammar/:level/:topic */
export class GetExercisesDto {
  @IsEnum(GrammarLevel)
  level!: LearnerLevel;

  @IsEnum(GrammarTopicParam)
  topic!: GrammarTopic;
}
