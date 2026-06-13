import { Injectable } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  DEFAULT_VOCAB_AI_TOPIC,
  VOCAB_EXERCISE_BLUEPRINTS,
} from '../../content/vocab-ai-exercise-seeds';
import {
  VocabExercise,
  VocabExerciseBlueprint,
  VocabExerciseType,
  VocabTopic,
} from '../interfaces/vocab-exercise.interface';

export interface GenerateAIVocabContext {
  userId?: string;
  sequence?: number;
}

const VALID_TYPES: VocabExerciseType[] = ['mcq', 'fill_in', 'match'];
const EXERCISE_TYPE_ORDER: VocabExerciseType[] = ['fill_in', 'mcq', 'match'];

const TOPIC_LABELS: Record<VocabTopic, string> = {
  common_nouns: 'everyday noun',
  common_verbs: 'everyday verb',
  adjectives: 'describing word',
  everyday_phrases: 'useful phrase',
  phrasal_verbs: 'phrasal verb',
  collocations: 'collocation',
  synonyms_antonyms: 'vocabulary pair',
  topic_travel: 'travel word',
  idioms: 'idiom',
  academic_words: 'academic word',
  topic_business: 'business term',
  topic_technology: 'technology term',
};

const TOPIC_COLLOCATIONS: Record<VocabTopic, string[]> = {
  common_nouns: ['common noun', 'everyday object', 'useful word'],
  common_verbs: ['daily routine', 'common action', 'simple verb'],
  adjectives: ['describing people', 'describing things', 'positive adjective'],
  everyday_phrases: ['polite phrase', 'daily greeting', 'natural expression'],
  phrasal_verbs: ['phrasal verb phrase', 'natural English', 'spoken English'],
  collocations: ['word pair', 'natural phrase', 'fixed expression'],
  synonyms_antonyms: ['similar meaning', 'opposite meaning', 'word choice'],
  topic_travel: ['travel plan', 'at the airport', 'hotel stay'],
  idioms: ['figurative meaning', 'informal English', 'natural idiom'],
  academic_words: ['academic writing', 'formal text', 'research context'],
  topic_business: ['workplace English', 'business meeting', 'professional tone'],
  topic_technology: ['digital tool', 'online account', 'tech context'],
};

const DISTRACTOR_WORDS = [
  'table',
  'garden',
  'window',
  'market',
  'village',
  'station',
  'kitchen',
  'library',
];

const generatedExercises = new Map<string, VocabExercise>();
const blueprintByExerciseId = new Map<string, VocabExerciseBlueprint>();

/**
 * Generates one vocabulary exercise from spec-aligned seeds.
 * Tone: friendly, clear, supportive (englexa_content_spec.md §2, §5).
 */
export function generateAIVocabExercise(
  level: LearnerLevel,
  topic: VocabTopic,
  optionalWord?: string | null,
  context: GenerateAIVocabContext = {},
): VocabExercise {
  const userId = context.userId ?? 'learner';
  const sequence = context.sequence ?? 0;
  const blueprint = optionalWord?.trim()
    ? buildWordFocusedBlueprint(level, topic, optionalWord.trim(), sequence)
    : pickSeedBlueprint(level, topic, userId, sequence);

  const word = normalizeWord(blueprint.correct_answer);
  const id = buildExerciseId(level, topic, userId, sequence, optionalWord ?? null);

  const exercise = validateVocabExerciseSchema({
    id,
    level,
    topic,
    type: blueprint.type,
    question: blueprint.question.trim(),
    options: normalizeOptions(blueprint.type, blueprint.options),
    correct_answer: blueprint.correct_answer.trim(),
    explanation: blueprint.explanation.trim(),
    example_sentence: blueprint.example_sentence.trim(),
    alternatives: buildAlternatives(blueprint),
  });

  generatedExercises.set(id, exercise);
  blueprintByExerciseId.set(id, blueprint);

  return exercise;
}

export function findGeneratedVocabExercise(exerciseId: string): VocabExercise | null {
  return generatedExercises.get(exerciseId) ?? null;
}

export function getVocabBlueprint(exerciseId: string): VocabExerciseBlueprint | null {
  return blueprintByExerciseId.get(exerciseId) ?? null;
}

export function validateVocabExerciseSchema(exercise: VocabExercise): VocabExercise {
  if (!exercise.id.trim()) {
    throw new Error('Exercise id is required.');
  }

  if (!VALID_TYPES.includes(exercise.type)) {
    throw new Error(`Invalid exercise type: ${exercise.type}`);
  }

  if (!exercise.question.trim()) {
    throw new Error('Exercise question is required.');
  }

  if (!exercise.correct_answer.trim()) {
    throw new Error('Exercise correct_answer is required.');
  }

  if (!exercise.explanation.trim()) {
    throw new Error('Exercise explanation is required.');
  }

  if (!exercise.example_sentence.trim()) {
    throw new Error('Exercise example_sentence is required.');
  }

  if (exercise.type === 'mcq' || exercise.type === 'match') {
    if (!exercise.options || exercise.options.length < 2) {
      throw new Error('MCQ and match exercises require at least two options.');
    }
  } else if (exercise.options !== null) {
    throw new Error('fill_in exercises must set options to null.');
  }

  return exercise;
}

function buildWordFocusedBlueprint(
  level: LearnerLevel,
  topic: VocabTopic,
  word: string,
  sequence: number,
): VocabExerciseBlueprint {
  const profile = lookupSeedProfile(word, topic, level);
  const collocations = profile?.collocations.length
    ? profile.collocations
    : buildCollocations(word, topic, sequence);
  const collocation = collocations[0]!;
  const meaning = profile
    ? firstSentence(profile.explanation)
    : buildDefaultMeaning(word, topic, level);
  const type = pickExerciseType(level, topic, word, sequence);
  const explanation = buildWordExplanation(word, meaning, collocation);
  const exampleSentence = profile?.example_sentence
    ? profile.example_sentence
    : buildExampleSentence(word, collocation, level, sequence);

  if (type === 'fill_in') {
    return {
      type,
      question: buildFillInQuestion(word, collocation, level),
      options: null,
      correct_answer: word,
      explanation,
      example_sentence: exampleSentence,
      collocations,
    };
  }

  if (type === 'mcq') {
    return {
      type,
      question: `Which word best matches this meaning? ${meaning}`,
      options: buildWordOptions(word, topic, sequence),
      correct_answer: word,
      explanation,
      example_sentence: exampleSentence,
      collocations,
    };
  }

  return {
    type: 'match',
    question: `Match the meaning to the correct word: ${meaning}`,
    options: buildWordOptions(word, topic, sequence + 1),
    correct_answer: word,
    explanation,
    example_sentence: exampleSentence,
    collocations,
  };
}

function pickSeedBlueprint(
  level: LearnerLevel,
  topic: VocabTopic,
  userId: string,
  sequence: number,
): VocabExerciseBlueprint {
  const pool =
    VOCAB_EXERCISE_BLUEPRINTS[topic]?.[level] ??
    VOCAB_EXERCISE_BLUEPRINTS[DEFAULT_VOCAB_AI_TOPIC]![level] ??
    VOCAB_EXERCISE_BLUEPRINTS[DEFAULT_VOCAB_AI_TOPIC]!.beginner;

  const blueprint = pool[hashSeed(`${userId}:${topic}:${level}:${sequence}`) % pool.length]!;
  const collocation = blueprint.collocations[0] ?? blueprint.correct_answer;

  return {
    ...blueprint,
    explanation: buildSeedExplanation(blueprint, collocation),
    example_sentence: blueprint.example_sentence,
  };
}

function buildSeedExplanation(
  blueprint: VocabExerciseBlueprint,
  collocation: string,
): string {
  const meaning = firstSentence(blueprint.explanation);
  return buildWordExplanation(blueprint.correct_answer, meaning, collocation);
}

function buildWordExplanation(
  word: string,
  meaning: string,
  collocation: string,
): string {
  return `${meaning} A natural choice is "${word}" in phrases like "${collocation}".`;
}

function buildDefaultMeaning(
  word: string,
  topic: VocabTopic,
  level: LearnerLevel,
): string {
  const label = TOPIC_LABELS[topic];
  const levelHint =
    level === 'beginner'
      ? 'This is a high-frequency word for daily use.'
      : level === 'intermediate'
        ? 'This word often appears in clear, natural English.'
        : 'This word is common in more precise, formal contexts.';

  return `"${word}" is a ${label}. ${levelHint}`;
}

function buildFillInQuestion(
  word: string,
  collocation: string,
  level: LearnerLevel,
): string {
  if (level === 'beginner') {
    return `Complete the sentence with "${word}": "We practised ___ in class today."`;
  }

  if (collocation.includes(word)) {
    return `Complete the collocation: "${collocation.replace(word, '___')}"`;
  }

  return `Complete the sentence using "${word}": "It helps to learn ___ in context."`;
}

function buildExampleSentence(
  word: string,
  collocation: string,
  level: LearnerLevel,
  sequence: number,
): string {
  const templates =
    level === 'beginner'
      ? [
          `I used "${word}" in a short sentence today.`,
          `This is a clear example: ${capitalize(buildCollocationSentence(collocation, word))}.`,
        ]
      : [
          `A natural example is: ${capitalize(buildCollocationSentence(collocation, word))}.`,
          `In context: ${capitalize(buildCollocationSentence(collocation, word))}.`,
        ];

  return templates[sequence % templates.length]!;
}

function buildCollocationSentence(collocation: string, word: string): string {
  if (collocation.includes(word)) {
    return collocation.endsWith('.') ? collocation : `${collocation}.`;
  }

  return `we often say "${collocation}" with "${word}"`;
}

function buildCollocations(
  word: string,
  topic: VocabTopic,
  sequence: number,
): string[] {
  const topicSet = TOPIC_COLLOCATIONS[topic];
  const primary = topicSet[sequence % topicSet.length]!;
  return [`${primary} with "${word}"`, `use "${word}" correctly`, collocationWithWord(word, topic)];
}

function collocationWithWord(word: string, topic: VocabTopic): string {
  if (topic === 'phrasal_verbs' || topic === 'idioms') {
    return `practise "${word}"`;
  }

  if (topic === 'collocations') {
    return `common ${word} phrases`;
  }

  return `learn "${word}"`;
}

function buildWordOptions(
  word: string,
  topic: VocabTopic,
  sequence: number,
): string[] {
  const seedWords = collectSeedWords(topic).filter(
    (item) => normalizeWord(item) !== normalizeWord(word),
  );
  const pool = seedWords.length > 0 ? seedWords : DISTRACTOR_WORDS;
  const distractors = pickDeterministic(
    pool,
    `${word}:${topic}:${sequence}`,
    3,
  );

  return shuffleDeterministic([word, ...distractors], `${word}:${topic}:${sequence}:opts`);
}

function collectSeedWords(topic: VocabTopic): string[] {
  const topicSeeds = VOCAB_EXERCISE_BLUEPRINTS[topic];
  if (!topicSeeds) {
    return [];
  }

  const words = new Set<string>();
  for (const levelPool of Object.values(topicSeeds)) {
    for (const item of levelPool) {
      words.add(item.correct_answer);
    }
  }

  return [...words];
}

function lookupSeedProfile(
  word: string,
  topic: VocabTopic,
  level: LearnerLevel,
): VocabExerciseBlueprint | null {
  const levels: LearnerLevel[] = [level, 'beginner', 'intermediate', 'advanced'];
  const normalized = normalizeWord(word);

  for (const candidateLevel of levels) {
    const pool = VOCAB_EXERCISE_BLUEPRINTS[topic]?.[candidateLevel] ?? [];
    const match = pool.find(
      (item) => normalizeWord(item.correct_answer) === normalized,
    );
    if (match) {
      return match;
    }
  }

  for (const topicSeeds of Object.values(VOCAB_EXERCISE_BLUEPRINTS)) {
    for (const levelPool of Object.values(topicSeeds ?? {})) {
      const match = levelPool.find(
        (item) => normalizeWord(item.correct_answer) === normalized,
      );
      if (match) {
        return match;
      }
    }
  }

  return null;
}

function pickExerciseType(
  level: LearnerLevel,
  topic: VocabTopic,
  word: string,
  sequence: number,
): VocabExerciseType {
  const index = hashSeed(`${level}:${topic}:${word}:${sequence}`) % EXERCISE_TYPE_ORDER.length;
  return EXERCISE_TYPE_ORDER[index]!;
}

function pickDeterministic<T>(pool: T[], seed: string, count: number): T[] {
  const copy = [...pool];
  const selected: T[] = [];

  for (let i = 0; i < count && copy.length > 0; i += 1) {
    const index = hashSeed(`${seed}:${i}`) % copy.length;
    selected.push(copy[index]!);
    copy.splice(index, 1);
  }

  return selected;
}

function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = hashSeed(`${seed}:${i}`) % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }

  return copy;
}

function buildAlternatives(blueprint: VocabExerciseBlueprint): string[] {
  if (blueprint.type === 'mcq' && blueprint.options) {
    return blueprint.options.filter((item) => item !== blueprint.correct_answer);
  }

  return [];
}

function normalizeOptions(
  type: VocabExerciseType,
  options: string[] | null,
): string[] | null {
  if (type === 'fill_in') {
    return null;
  }

  return options?.map((item) => item.trim()) ?? null;
}

function buildExerciseId(
  level: LearnerLevel,
  topic: VocabTopic,
  userId: string,
  sequence: number,
  optionalWord: string | null,
): string {
  const wordPart = optionalWord
    ? `_${normalizeWord(optionalWord).replace(/\s+/g, '_').slice(0, 24)}`
    : '';

  return `ai_${level}_${topic}_${hashSeed(userId)}_${sequence}${wordPart}`;
}

function normalizeWord(value: string): string {
  return value.trim().toLowerCase();
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : trimmed;
}

function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** @internal Test helper */
export function clearGeneratedVocabCache(): void {
  generatedExercises.clear();
  blueprintByExerciseId.clear();
}

@Injectable()
export class AiVocabGenerator {
  generate(
    userId: string,
    level: LearnerLevel,
    topic: VocabTopic,
    sequence: number,
    optionalWord?: string | null,
  ): VocabExercise {
    return generateAIVocabExercise(level, topic, optionalWord, {
      userId,
      sequence,
    });
  }

  findById(exerciseId: string): VocabExercise | null {
    return findGeneratedVocabExercise(exerciseId);
  }
}
