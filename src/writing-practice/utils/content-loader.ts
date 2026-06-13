import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  WritingPrompt,
  WritingTopic,
} from '../interfaces/writing-prompt.interface';

const jsonCache = new Map<string, WritingPrompt[]>();

export function resolveWritingJsonPath(
  level: LearnerLevel,
  topic: WritingTopic,
  moduleDir: string,
): string {
  const fileName = `${topic}.json`;
  const candidates = [
    path.join(process.cwd(), 'content', 'writing-practice', level, fileName),
    path.join(moduleDir, 'content', level, fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new NotFoundException(
    `No writing prompts found for level "${level}" and topic "${topic}"`,
  );
}

export function loadWritingPrompts(
  level: LearnerLevel,
  topic: WritingTopic,
  moduleDir: string,
): WritingPrompt[] {
  const cacheKey = `${level}:${topic}`;
  const cached = jsonCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = resolveWritingJsonPath(level, topic, moduleDir);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as WritingPrompt[];
  jsonCache.set(cacheKey, parsed);
  return parsed;
}

/** @internal Test helper */
export function clearWritingPromptCache(): void {
  jsonCache.clear();
}
