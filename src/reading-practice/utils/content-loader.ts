import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  ReadingPassage,
  ReadingTopic,
} from '../interfaces/reading-passage.interface';

const jsonCache = new Map<string, ReadingPassage[]>();

/**
 * Resolves content/reading-practice/<level>/<topic>.json,
 * falling back to module content/.
 */
export function resolveReadingJsonPath(
  level: LearnerLevel,
  topic: ReadingTopic,
  moduleDir: string,
): string {
  const fileName = `${topic}.json`;
  const candidates = [
    path.join(process.cwd(), 'content', 'reading-practice', level, fileName),
    path.join(moduleDir, 'content', level, fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new NotFoundException(
    `No reading passages found for level "${level}" and topic "${topic}"`,
  );
}

export function loadReadingPassages(
  level: LearnerLevel,
  topic: ReadingTopic,
  moduleDir: string,
): ReadingPassage[] {
  const cacheKey = `${level}:${topic}`;
  const cached = jsonCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = resolveReadingJsonPath(level, topic, moduleDir);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<
    ReadingPassage & {
      questions: Array<{ alternatives?: string[] }>;
    }
  >;

  const passages = parsed.map((item) => ({
    ...item,
    questions: item.questions.map((question) => ({
      ...question,
      alternatives: question.alternatives ?? [],
    })),
  }));

  jsonCache.set(cacheKey, passages);
  return passages;
}

/** @internal Test helper */
export function clearReadingPassageCache(): void {
  jsonCache.clear();
}
