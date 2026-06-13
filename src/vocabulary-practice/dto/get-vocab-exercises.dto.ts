import { IsEnum } from 'class-validator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { VocabTopic } from '../interfaces/vocab-exercise.interface';

export enum VocabLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum VocabTopicParam {
  COMMON_NOUNS = 'common_nouns',
  COMMON_VERBS = 'common_verbs',
  ADJECTIVES = 'adjectives',
  EVERYDAY_PHRASES = 'everyday_phrases',
  PHRASAL_VERBS = 'phrasal_verbs',
  COLLOCATIONS = 'collocations',
  SYNONYMS_ANTONYMS = 'synonyms_antonyms',
  TOPIC_TRAVEL = 'topic_travel',
  IDIOMS = 'idioms',
  ACADEMIC_WORDS = 'academic_words',
  TOPIC_BUSINESS = 'topic_business',
  TOPIC_TECHNOLOGY = 'topic_technology',
}

export class GetVocabExercisesDto {
  @IsEnum(VocabLevel)
  level!: LearnerLevel;

  @IsEnum(VocabTopicParam)
  topic!: VocabTopic;
}
