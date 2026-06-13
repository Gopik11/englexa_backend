import { Injectable } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  DEFAULT_SPEAKING_AI_TOPIC,
  SPEAKING_LEVEL_FALLBACK_BLUEPRINTS,
  SPEAKING_PROMPT_BLUEPRINTS,
  SpeakingPromptBlueprint,
} from '../../content/speaking-ai-prompt-seeds';
import {
  AISpeakingPrompt,
  SpeakingPrompt,
  SpeakingTopic,
} from '../interfaces/speaking-prompt.interface';

export interface GenerateSpeakingPromptContext {
  userId?: string;
  sequence?: number;
}

const generatedPrompts = new Map<string, SpeakingPrompt>();

const LEVEL_ORDER: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];

const DEFAULT_TIME_LIMIT_SECONDS: Record<LearnerLevel, number> = {
  beginner: 30,
  intermediate: 45,
  advanced: 55,
};

/**
 * Generates a level-appropriate speaking prompt from spec-aligned seeds.
 *
 * - Beginner: simple personal questions
 * - Intermediate: daily life / opinions
 * - Advanced: abstract topics / arguments
 */
export function generateSpeakingPrompt(
  level: LearnerLevel,
  topic: SpeakingTopic,
  context: GenerateSpeakingPromptContext = {},
): AISpeakingPrompt {
  const userId = context.userId ?? 'learner';
  const sequence = context.sequence ?? 0;
  const blueprint = pickBlueprint(level, topic, userId, sequence);
  const id = buildPromptId(level, topic, userId, sequence);

  const prompt = validateSpeakingPromptSchema({
    id,
    level,
    topic,
    prompt: blueprint.prompt.trim(),
    example_answer: blueprint.example_answer.trim(),
  });

  generatedPrompts.set(id, toStoredPrompt(prompt));
  return prompt;
}

/** @deprecated Use generateSpeakingPrompt */
export function generateAISpeakingPrompt(
  level: LearnerLevel,
  topic: SpeakingTopic,
  context: GenerateSpeakingPromptContext = {},
): SpeakingPrompt {
  const aiPrompt = generateSpeakingPrompt(level, topic, context);
  return toStoredPrompt(aiPrompt);
}

export function findGeneratedSpeakingPrompt(
  promptId: string,
): SpeakingPrompt | null {
  return generatedPrompts.get(promptId) ?? null;
}

export function validateSpeakingPromptSchema(
  prompt: AISpeakingPrompt,
): AISpeakingPrompt {
  if (!prompt.id.trim()) {
    throw new Error('Prompt id is required.');
  }
  if (!prompt.prompt.trim()) {
    throw new Error('Prompt text is required.');
  }
  if (!prompt.example_answer.trim()) {
    throw new Error('Example answer is required.');
  }

  return prompt;
}

function pickBlueprint(
  level: LearnerLevel,
  topic: SpeakingTopic,
  userId: string,
  sequence: number,
): SpeakingPromptBlueprint {
  const pool = resolveBlueprintPool(level, topic);
  const index = hashSeed(`${userId}:${topic}:${level}:${sequence}`) % pool.length;
  return pool[index]!;
}

function resolveBlueprintPool(
  level: LearnerLevel,
  topic: SpeakingTopic,
): SpeakingPromptBlueprint[] {
  const topicSeeds = SPEAKING_PROMPT_BLUEPRINTS[topic];
  const topicPool = collectPoolsForTopic(topicSeeds, level);
  if (topicPool.length > 0) {
    return topicPool;
  }

  const defaultSeeds = SPEAKING_PROMPT_BLUEPRINTS[DEFAULT_SPEAKING_AI_TOPIC];
  const defaultPool = collectPoolsForTopic(defaultSeeds, level);
  if (defaultPool.length > 0) {
    return defaultPool;
  }

  const levelFallback = SPEAKING_LEVEL_FALLBACK_BLUEPRINTS[level];
  if (levelFallback.length > 0) {
    return levelFallback;
  }

  throw new Error(
    `No AI speaking blueprints found for topic "${topic}" at level "${level}".`,
  );
}

function collectPoolsForTopic(
  seeds: Partial<Record<LearnerLevel, SpeakingPromptBlueprint[]>> | undefined,
  preferredLevel: LearnerLevel,
): SpeakingPromptBlueprint[] {
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

function toStoredPrompt(prompt: AISpeakingPrompt): SpeakingPrompt {
  return {
    id: prompt.id,
    level: prompt.level,
    topic: prompt.topic,
    title: deriveTitle(prompt.prompt),
    prompt: prompt.prompt,
    example_answer: prompt.example_answer,
    reference_text: prompt.example_answer,
    key_vocabulary: extractKeyVocabulary(prompt.example_answer),
    time_limit_seconds: DEFAULT_TIME_LIMIT_SECONDS[prompt.level],
  };
}

function deriveTitle(prompt: string): string {
  const trimmed = prompt.trim();
  if (trimmed.length <= 48) {
    return trimmed;
  }
  return `${trimmed.slice(0, 45).trim()}...`;
}

function extractKeyVocabulary(exampleAnswer: string): string[] {
  const stopWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'my',
    'your',
    'is',
    'am',
    'are',
    'was',
    'were',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
  ]);

  const words = exampleAnswer
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 5);
}

function buildPromptId(
  level: LearnerLevel,
  topic: SpeakingTopic,
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
export function clearGeneratedSpeakingCache(): void {
  generatedPrompts.clear();
}

@Injectable()
export class AiSpeakingPromptGenerator {
  generate(
    userId: string,
    level: LearnerLevel,
    topic: SpeakingTopic,
    sequence: number,
  ): SpeakingPrompt {
    return toStoredPrompt(
      generateSpeakingPrompt(level, topic, { userId, sequence }),
    );
  }

  generatePublic(
    userId: string,
    level: LearnerLevel,
    topic: SpeakingTopic,
    sequence: number,
  ): AISpeakingPrompt {
    return generateSpeakingPrompt(level, topic, { userId, sequence });
  }

  findById(promptId: string): SpeakingPrompt | null {
    return findGeneratedSpeakingPrompt(promptId);
  }
}
