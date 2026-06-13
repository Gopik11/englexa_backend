import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import {
  SpeakingPrompt,
  SpeakingTopic,
} from '../interfaces/speaking-prompt.interface';

const jsonCache = new Map<string, SpeakingPrompt[]>();

export function resolveSpeakingJsonPath(
  level: LearnerLevel,
  topic: SpeakingTopic,
  moduleDir: string,
): string {
  const fileName = `${topic}.json`;
  const candidates = [
    path.join(process.cwd(), 'content', 'speaking-practice', level, fileName),
    path.join(moduleDir, 'content', level, fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new NotFoundException(
    `No speaking prompts found for level "${level}" and topic "${topic}"`,
  );
}

export function loadSpeakingPrompts(
  level: LearnerLevel,
  topic: SpeakingTopic,
  moduleDir: string,
): SpeakingPrompt[] {
  const cacheKey = `${level}:${topic}`;
  const cached = jsonCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = resolveSpeakingJsonPath(level, topic, moduleDir);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<
    SpeakingPrompt & { example_answer?: string }
  >;
  const prompts = parsed.map((item) => {
    const exampleAnswer = item.example_answer ?? item.reference_text ?? '';
    return {
      ...item,
      example_answer: exampleAnswer,
      reference_text: item.reference_text ?? exampleAnswer,
      key_vocabulary: item.key_vocabulary ?? [],
    };
  });
  jsonCache.set(cacheKey, prompts);
  return prompts;
}

/** @internal Test helper */
export function clearSpeakingPromptCache(): void {
  jsonCache.clear();
}
