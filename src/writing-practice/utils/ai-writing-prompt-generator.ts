import { Injectable } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  DEFAULT_WRITING_AI_TOPIC,
  WRITING_LEVEL_FALLBACK_BLUEPRINTS,
  WRITING_PROMPT_BLUEPRINTS,
  WritingPromptBlueprint,
} from '../../content/writing-ai-prompt-seeds';
import {
  AIWritingPrompt,
  WritingPrompt,
  WritingTopic,
} from '../interfaces/writing-prompt.interface';

export interface GenerateWritingPromptContext {
  userId?: string;
  sequence?: number;
}

const generatedPrompts = new Map<string, WritingPrompt>();

const LEVEL_ORDER: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Generates a level-appropriate writing task from spec-aligned seeds.
 *
 * - Beginner: short paragraphs (5–6 sentences)
 * - Intermediate: opinion paragraphs
 * - Advanced: argumentative / problem-solution tasks
 */
export function generateWritingPrompt(
  level: LearnerLevel,
  topic: WritingTopic,
  context: GenerateWritingPromptContext = {},
): AIWritingPrompt {
  const userId = context.userId ?? 'learner';
  const sequence = context.sequence ?? 0;
  const blueprint = pickBlueprint(level, topic, userId, sequence);
  const id = buildPromptId(level, topic, userId, sequence);

  const prompt = validateWritingPromptSchema({
    id,
    level,
    topic,
    prompt: blueprint.prompt.trim(),
    word_limit: blueprint.word_limit,
    example_outline: blueprint.example_outline.map((item) => item.trim()),
  });

  generatedPrompts.set(id, toStoredPrompt(prompt, blueprint));
  return prompt;
}

export function findGeneratedWritingPrompt(
  promptId: string,
): WritingPrompt | null {
  return generatedPrompts.get(promptId) ?? null;
}

export function validateWritingPromptSchema(
  prompt: AIWritingPrompt,
): AIWritingPrompt {
  if (!prompt.id.trim()) {
    throw new Error('Prompt id is required.');
  }
  if (!prompt.prompt.trim()) {
    throw new Error('Prompt text is required.');
  }
  if (prompt.word_limit < 20) {
    throw new Error('Word limit must be at least 20.');
  }
  if (prompt.example_outline.length < 3) {
    throw new Error('Example outline must include at least three steps.');
  }

  return prompt;
}

function pickBlueprint(
  level: LearnerLevel,
  topic: WritingTopic,
  userId: string,
  sequence: number,
): WritingPromptBlueprint {
  const pool = resolveBlueprintPool(level, topic);
  const index = hashSeed(`${userId}:${topic}:${level}:${sequence}`) % pool.length;
  return pool[index]!;
}

function resolveBlueprintPool(
  level: LearnerLevel,
  topic: WritingTopic,
): WritingPromptBlueprint[] {
  const topicSeeds = WRITING_PROMPT_BLUEPRINTS[topic];
  const topicPool = collectPoolsForTopic(topicSeeds, level);
  if (topicPool.length > 0) {
    return topicPool;
  }

  const defaultSeeds = WRITING_PROMPT_BLUEPRINTS[DEFAULT_WRITING_AI_TOPIC];
  const defaultPool = collectPoolsForTopic(defaultSeeds, level);
  if (defaultPool.length > 0) {
    return defaultPool;
  }

  const levelFallback = WRITING_LEVEL_FALLBACK_BLUEPRINTS[level];
  if (levelFallback.length > 0) {
    return levelFallback;
  }

  throw new Error(
    `No AI writing blueprints found for topic "${topic}" at level "${level}".`,
  );
}

function collectPoolsForTopic(
  seeds: Partial<Record<LearnerLevel, WritingPromptBlueprint[]>> | undefined,
  preferredLevel: LearnerLevel,
): WritingPromptBlueprint[] {
  if (!seeds) {
    return [];
  }

  const preferredPool = seeds[preferredLevel];
  if (preferredPool?.length) {
    return preferredPool;
  }

  for (const candidateLevel of LEVEL_ORDER) {
    if (candidateLevel === preferredLevel) {
      continue;
    }
    const levelPool = seeds[candidateLevel];
    if (levelPool?.length) {
      return levelPool;
    }
  }

  return [];
}

function toStoredPrompt(
  prompt: AIWritingPrompt,
  blueprint: WritingPromptBlueprint,
): WritingPrompt {
  const minWords = Math.max(20, Math.round(prompt.word_limit * 0.85));

  return {
    id: prompt.id,
    level: prompt.level,
    topic: prompt.topic,
    title: blueprint.title.trim(),
    prompt: prompt.prompt,
    word_count_min: minWords,
    word_count_max: prompt.word_limit,
    example_outline: [...prompt.example_outline],
  };
}

function buildPromptId(
  level: LearnerLevel,
  topic: WritingTopic,
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
export function clearGeneratedWritingCache(): void {
  generatedPrompts.clear();
}

@Injectable()
export class AiWritingPromptGenerator {
  generate(
    userId: string,
    level: LearnerLevel,
    topic: WritingTopic,
    sequence: number,
  ): WritingPrompt {
    const aiPrompt = generateWritingPrompt(level, topic, { userId, sequence });
    return generatedPrompts.get(aiPrompt.id)!;
  }

  generatePublic(
    userId: string,
    level: LearnerLevel,
    topic: WritingTopic,
    sequence: number,
  ): AIWritingPrompt {
    return generateWritingPrompt(level, topic, { userId, sequence });
  }

  findById(promptId: string): WritingPrompt | null {
    return findGeneratedWritingPrompt(promptId);
  }
}
