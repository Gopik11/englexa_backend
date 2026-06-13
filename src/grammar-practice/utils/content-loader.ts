import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  GrammarExercise,
  GrammarTopic,
} from '../interfaces/grammar-exercise.interface';

const jsonCache = new Map<string, GrammarExercise[]>();

/**
 * Resolves content/grammar/<level>/<topic>.json, falling back to module content/.
 */
export function resolveGrammarJsonPath(
  level: LearnerLevel,
  topic: GrammarTopic,
  moduleDir: string,
): string {
  const fileName = `${topic}.json`;
  const candidates = [
    path.join(process.cwd(), 'content', 'grammar', level, fileName),
    path.join(moduleDir, 'content', level, fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new NotFoundException(
    `No exercises found for level "${level}" and topic "${topic}"`,
  );
}

export function loadGrammarExercises(
  level: LearnerLevel,
  topic: GrammarTopic,
  moduleDir: string,
): GrammarExercise[] {
  const cacheKey = `${level}:${topic}`;
  const cached = jsonCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = resolveGrammarJsonPath(level, topic, moduleDir);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<
    GrammarExercise & { alternatives?: string[] }
  >;
  const exercises = parsed.map((item) => ({
    ...item,
    alternatives: item.alternatives ?? [],
  }));
  jsonCache.set(cacheKey, exercises);
  return exercises;
}

/** @internal Test helper */
export function clearGrammarExerciseCache(): void {
  jsonCache.clear();
}
