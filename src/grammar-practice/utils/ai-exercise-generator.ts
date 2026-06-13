import { Injectable } from '@nestjs/common';
import { buildGeneratorConceptExplanation } from '../../content/feedback-enrichment';
import {
  GrammarRuleKey,
  LearnerLevel,
} from '../../content/englexa-content-spec.constants';
import {
  DEFAULT_AI_TOPIC,
  GRAMMAR_EXERCISE_BLUEPRINTS,
} from '../../content/grammar-ai-exercise-seeds';
import {
  GrammarExercise,
  GrammarExerciseBlueprint,
  GrammarExerciseType,
  GrammarTopic,
} from '../interfaces/grammar-exercise.interface';

/** Context required for deterministic, reproducible exercise selection. */
export interface GenerateAIExerciseContext {
  userId: string;
  sequence: number;
  /** When set, generate an exercise targeting this grammar concept. */
  concept?: string | null;
  /** @deprecated Use [concept] instead. */
  targetConcept?: string | null;
}

const VALID_EXERCISE_TYPES: GrammarExerciseType[] = [
  'fill_blank',
  'correction',
  'mcq',
  'rewrite',
  'short_answer',
];

/** Maps identifyConcept() labels to spec rule keys for blueprint selection. */
const CONCEPT_RULE_KEYS: Record<string, GrammarRuleKey[]> = {
  Articles: ['article'],
  'Subject-Verb Agreement': ['simple_present', 'missing_subject'],
  'Simple Present': ['simple_present'],
  'Past Tense': ['verb_tense'],
  Prepositions: ['preposition'],
  'Present vs Continuous': ['present_continuous', 'simple_present'],
  'Past vs Continuous': ['past_continuous', 'verb_tense'],
  'Countable / Uncountable': ['countable'],
  Comparatives: ['comparative'],
  Modals: ['modal'],
  Adverbs: ['adverb'],
  Conditionals: ['conditional'],
  'Relative Clauses': ['relative_clause'],
  'Passive Voice': ['passive'],
  'Reported Speech': ['reported_speech'],
  'Perfect Tenses': ['perfect_tense'],
  Connectors: ['connector'],
  'Sentence Structure': ['missing_subject'],
  'Verb Tense': ['verb_tense'],
};

const generatedExercises = new Map<string, GrammarExercise>();
const blueprintByExerciseId = new Map<string, GrammarExerciseBlueprint>();

/**
 * Generates one AI exercise from spec blueprints.
 * Explanations use buildGrammarExplanation() — rule text from the content spec.
 * Tone: simple, clear, supportive (englexa_content_spec.md §2).
 */
export function generateAIExercise(
  level: LearnerLevel,
  topic: GrammarTopic,
  context: GenerateAIExerciseContext,
): GrammarExercise {
  const concept = resolveConcept(context);
  const blueprint = pickBlueprint(
    level,
    topic,
    context.userId,
    context.sequence,
    concept,
  );
  const id = buildExerciseId(level, topic, context.userId, context.sequence, concept);

  const exercise = validateGrammarExerciseSchema({
    id,
    level,
    topic,
    type: blueprint.type,
    question: blueprint.question.trim(),
    options: normalizeOptions(blueprint.type, blueprint.options),
    correct_answer: blueprint.correct_answer.trim(),
    explanation: buildConceptExplanation(
      concept,
      blueprint.ruleKey,
      blueprint.exampleSentence,
    ),
  });

  generatedExercises.set(id, exercise);
  blueprintByExerciseId.set(id, blueprint);
  return exercise;
}

export function findGeneratedExercise(
  exerciseId: string,
): GrammarExercise | null {
  return generatedExercises.get(exerciseId) ?? null;
}

export function getSampleWrongSentence(exercise: GrammarExercise): string {
  const blueprint = blueprintByExerciseId.get(exercise.id);
  if (blueprint) {
    return blueprint.sampleWrongSentence;
  }
  return exercise.question;
}

/** Validates output matches the grammar exercise JSON schema. */
export function validateGrammarExerciseSchema(
  exercise: GrammarExercise,
): GrammarExercise {
  if (!exercise.id.trim()) {
    throw new Error('Exercise id is required.');
  }

  if (!VALID_EXERCISE_TYPES.includes(exercise.type)) {
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

  if (exercise.type === 'mcq') {
    if (!exercise.options || exercise.options.length < 2) {
      throw new Error('MCQ exercises require at least two options.');
    }
  } else if (exercise.options !== null) {
    throw new Error(`Non-MCQ exercises must set options to null (${exercise.type}).`);
  }

  return exercise;
}

function resolveConcept(context: GenerateAIExerciseContext): string | null {
  const concept = context.concept ?? context.targetConcept ?? null;
  return concept?.trim() ? concept.trim() : null;
}

function pickBlueprint(
  level: LearnerLevel,
  topic: GrammarTopic,
  userId: string,
  sequence: number,
  concept: string | null,
): GrammarExerciseBlueprint {
  const topicPool =
    GRAMMAR_EXERCISE_BLUEPRINTS[topic]?.[level] ??
    GRAMMAR_EXERCISE_BLUEPRINTS[DEFAULT_AI_TOPIC]![level];

  if (concept) {
    const conceptPool = filterBlueprintsByConcept(topicPool, concept);
    if (conceptPool.length > 0) {
      return selectBlueprint(conceptPool, userId, topic, level, sequence, concept);
    }

    const globalPool = collectBlueprintsForConcept(level, concept);
    if (globalPool.length > 0) {
      return selectBlueprint(globalPool, userId, topic, level, sequence, concept);
    }
  }

  return selectBlueprint(topicPool, userId, topic, level, sequence, concept);
}

function filterBlueprintsByConcept(
  pool: GrammarExerciseBlueprint[],
  concept: string,
): GrammarExerciseBlueprint[] {
  const ruleKeys = CONCEPT_RULE_KEYS[concept];
  if (!ruleKeys?.length) {
    return [];
  }

  return pool.filter((item) => ruleKeys.includes(item.ruleKey));
}

function collectBlueprintsForConcept(
  level: LearnerLevel,
  concept: string,
): GrammarExerciseBlueprint[] {
  const ruleKeys = CONCEPT_RULE_KEYS[concept];
  if (!ruleKeys?.length) {
    return [];
  }

  const matches: GrammarExerciseBlueprint[] = [];

  for (const topicSeeds of Object.values(GRAMMAR_EXERCISE_BLUEPRINTS)) {
    const levelPool = topicSeeds?.[level] ?? [];
    matches.push(...levelPool.filter((item) => ruleKeys.includes(item.ruleKey)));
  }

  return matches;
}

function selectBlueprint(
  pool: GrammarExerciseBlueprint[],
  userId: string,
  topic: GrammarTopic,
  level: LearnerLevel,
  sequence: number,
  concept: string | null,
): GrammarExerciseBlueprint {
  const index = deterministicIndex(userId, topic, level, sequence, concept, pool.length);
  return pool[index]!;
}

function buildConceptExplanation(
  concept: string | null,
  ruleKey: GrammarRuleKey,
  exampleSentence: string,
): string {
  const ruleExplanation = buildGeneratorConceptExplanation(
    ruleKey,
    exampleSentence,
  );

  if (!concept) {
    return ruleExplanation;
  }

  return `${concept}: ${ruleExplanation}`;
}

function normalizeOptions(
  type: GrammarExerciseType,
  options: string[] | null,
): string[] | null {
  if (type === 'mcq') {
    return options ?? [];
  }

  return null;
}

function buildExerciseId(
  level: LearnerLevel,
  topic: GrammarTopic,
  userId: string,
  sequence: number,
  concept: string | null,
): string {
  const key = deterministicHash(
    `${userId}:${level}:${topic}:${sequence}:${concept ?? 'general'}`,
  );
  return `ai_${level}_${topic}_${key}`;
}

function deterministicIndex(
  userId: string,
  topic: string,
  level: string,
  sequence: number,
  concept: string | null,
  length: number,
): number {
  if (length === 0) {
    throw new Error('Cannot select blueprint from an empty pool.');
  }

  const seed = `${userId}:${topic}:${level}:${sequence}:${concept ?? 'general'}`;
  return deterministicHash(seed) % length;
}

function deterministicHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** NestJS wrapper — caches generated exercises for submit lookup. */
@Injectable()
export class AiExerciseGenerator {
  generate(
    userId: string,
    level: LearnerLevel,
    topic: GrammarTopic,
    sequence: number,
    concept?: string | null,
  ): GrammarExercise {
    return generateAIExercise(level, topic, {
      userId,
      sequence,
      concept,
    });
  }

  findById(exerciseId: string): GrammarExercise | null {
    return findGeneratedExercise(exerciseId);
  }

  getSampleWrongSentence(exercise: GrammarExercise): string {
    return getSampleWrongSentence(exercise);
  }
}

/** @internal Resets in-memory cache between tests. */
export function clearGeneratedExerciseCache(): void {
  generatedExercises.clear();
  blueprintByExerciseId.clear();
}
