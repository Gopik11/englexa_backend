import { Injectable } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  DEFAULT_READING_AI_TOPIC,
  READING_PASSAGE_BLUEPRINTS,
  ReadingPassageBlueprint,
  ReadingQuestionBlueprint,
} from '../../content/reading-ai-passage-seeds';
import {
  ReadingPassage,
  ReadingQuestion,
  ReadingTopic,
} from '../interfaces/reading-passage.interface';

export interface GenerateAIReadingContext {
  userId?: string;
  sequence?: number;
}

const generatedPassages = new Map<string, ReadingPassage>();

const LEVEL_ORDER: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Generates one reading passage from spec-aligned seeds.
 * Tone: friendly, clear, supportive (englexa_content_spec.md §2).
 */
export function generateAIReadingPassage(
  level: LearnerLevel,
  topic: ReadingTopic,
  context: GenerateAIReadingContext = {},
): ReadingPassage {
  const userId = context.userId ?? 'learner';
  const sequence = context.sequence ?? 0;
  const blueprint = pickBlueprint(level, topic, userId, sequence);
  const id = buildPassageId(level, topic, userId, sequence);
  const questionCount = pickQuestionCount(userId, topic, sequence, blueprint);

  const passage = validateReadingPassageSchema({
    id,
    level,
    topic,
    title: blueprint.title.trim(),
    passage: blueprint.passage.trim(),
    questions: blueprint.questions
      .slice(0, questionCount)
      .map((question, index) => toReadingQuestion(id, index + 1, question)),
  });

  generatedPassages.set(id, passage);
  return passage;
}

export function findGeneratedReadingPassage(
  passageId: string,
): ReadingPassage | null {
  return generatedPassages.get(passageId) ?? null;
}

export function validateReadingPassageSchema(
  passage: ReadingPassage,
): ReadingPassage {
  if (!passage.id.trim()) {
    throw new Error('Passage id is required.');
  }

  if (!passage.title.trim()) {
    throw new Error('Passage title is required.');
  }

  if (!passage.passage.trim()) {
    throw new Error('Passage text is required.');
  }

  if (passage.questions.length < 3 || passage.questions.length > 5) {
    throw new Error('Passage must include 3–5 questions.');
  }

  for (const question of passage.questions) {
    if (!question.question.trim()) {
      throw new Error('Question text is required.');
    }

    if (!question.correct_answer.trim()) {
      throw new Error('Question correct_answer is required.');
    }

    if (!question.explanation.trim()) {
      throw new Error('Question explanation is required.');
    }

    if (question.type === 'mcq') {
      if (!question.options || question.options.length < 2) {
        throw new Error('MCQ questions require at least two options.');
      }
    } else if (question.options !== null) {
      throw new Error('short_answer questions must set options to null.');
    }
  }

  return passage;
}

function pickBlueprint(
  level: LearnerLevel,
  topic: ReadingTopic,
  userId: string,
  sequence: number,
): ReadingPassageBlueprint {
  const pool = resolveBlueprintPool(level, topic);
  const index = hashSeed(`${userId}:${topic}:${level}:${sequence}`) % pool.length;
  return pool[index]!;
}

function resolveBlueprintPool(
  level: LearnerLevel,
  topic: ReadingTopic,
): ReadingPassageBlueprint[] {
  const topicSeeds = READING_PASSAGE_BLUEPRINTS[topic];
  const topicPool = collectPoolsForTopic(topicSeeds, level);
  if (topicPool.length > 0) {
    return topicPool;
  }

  const defaultSeeds = READING_PASSAGE_BLUEPRINTS[DEFAULT_READING_AI_TOPIC];
  const defaultPool = collectPoolsForTopic(defaultSeeds, level);
  if (defaultPool.length > 0) {
    return defaultPool;
  }

  throw new Error(`No AI reading blueprints found for topic "${topic}" at level "${level}".`);
}

function collectPoolsForTopic(
  seeds: Partial<Record<LearnerLevel, ReadingPassageBlueprint[]>> | undefined,
  preferredLevel: LearnerLevel,
): ReadingPassageBlueprint[] {
  if (!seeds) {
    return [];
  }

  const orderedLevels = [
    preferredLevel,
    ...LEVEL_ORDER.filter((item) => item !== preferredLevel),
  ];

  const pool: ReadingPassageBlueprint[] = [];
  for (const candidateLevel of orderedLevels) {
    const levelPool = seeds[candidateLevel];
    if (levelPool?.length) {
      pool.push(...levelPool);
    }
  }

  return pool;
}

function pickQuestionCount(
  userId: string,
  topic: ReadingTopic,
  sequence: number,
  blueprint: ReadingPassageBlueprint,
): number {
  const desired = 3 + (hashSeed(`${userId}:${topic}:${sequence}:count`) % 3);
  return Math.min(desired, blueprint.questions.length);
}

function toReadingQuestion(
  passageId: string,
  index: number,
  blueprint: ReadingQuestionBlueprint,
): ReadingQuestion {
  return {
    id: `${passageId}_q${index}`,
    type: blueprint.type,
    question: blueprint.question.trim(),
    options:
      blueprint.type === 'mcq'
        ? blueprint.options?.map((item) => item.trim()) ?? null
        : null,
    correct_answer: blueprint.correct_answer.trim(),
    explanation: blueprint.explanation.trim(),
    alternatives: blueprint.alternatives ?? [],
  };
}

function buildPassageId(
  level: LearnerLevel,
  topic: ReadingTopic,
  userId: string,
  sequence: number,
): string {
  return `ai_${level}_${topic}_${hashSeed(userId)}_${sequence}`;
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
export function clearGeneratedReadingCache(): void {
  generatedPassages.clear();
}

@Injectable()
export class AiReadingGenerator {
  generate(
    userId: string,
    level: LearnerLevel,
    topic: ReadingTopic,
    sequence: number,
  ): ReadingPassage {
    return generateAIReadingPassage(level, topic, { userId, sequence });
  }

  findById(passageId: string): ReadingPassage | null {
    return findGeneratedReadingPassage(passageId);
  }
}
