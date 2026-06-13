import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  VocabExercise,
  VocabTopic,
} from '../interfaces/vocab-exercise.interface';

const jsonCache = new Map<string, VocabExercise[]>();

/**
 * Resolves content/vocabulary-practice/<level>/<topic>.json,
 * falling back to module content/.
 */
export function resolveVocabJsonPath(
  level: LearnerLevel,
  topic: VocabTopic,
  moduleDir: string,
): string {
  const fileName = `${topic}.json`;
  const candidates = [
    path.join(process.cwd(), 'content', 'vocabulary-practice', level, fileName),
    path.join(moduleDir, 'content', level, fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new NotFoundException(
    `No vocabulary exercises found for level "${level}" and topic "${topic}"`,
  );
}

export function loadVocabExercises(
  level: LearnerLevel,
  topic: VocabTopic,
  moduleDir: string,
): VocabExercise[] {
  const cacheKey = `${level}:${topic}`;
  const cached = jsonCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = resolveVocabJsonPath(level, topic, moduleDir);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<
    VocabExercise & { alternatives?: string[] }
  >;
  const exercises = parsed.map((item) => ({
    ...item,
    alternatives: item.alternatives ?? [],
  }));
  jsonCache.set(cacheKey, exercises);
  return exercises;
}

/** @internal Test helper */
export function clearVocabExerciseCache(): void {
  jsonCache.clear();
}
