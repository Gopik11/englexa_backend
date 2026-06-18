import { BadRequestException } from '@nestjs/common';
import { SubmitWritingResult } from '../../writing-practice/interfaces/writing-prompt.interface';
import { evaluateWriting } from '../../writing-practice/utils/writing-evaluator';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WritingTopic } from '../../writing-practice/interfaces/writing-prompt.interface';

export const MIN_WRITING_LENGTH = 10;
export const MAX_WRITING_LENGTH = 10_000;

export function validateWritingText(text: string): void {
  const trimmed = text?.trim() ?? '';
  if (trimmed.length < MIN_WRITING_LENGTH) {
    throw new BadRequestException(
      `Writing must be at least ${MIN_WRITING_LENGTH} characters.`,
    );
  }
  if (trimmed.length > MAX_WRITING_LENGTH) {
    throw new BadRequestException(
      `Writing must not exceed ${MAX_WRITING_LENGTH} characters.`,
    );
  }
}

export function buildWritingFallback(
  userId: string,
  level: LearnerLevel,
  topic: WritingTopic,
  text: string,
): SubmitWritingResult {
  return evaluateWriting(level, topic, text, { userId });
}

export function normalizeWritingSubmitPayload(
  result: SubmitWritingResult & {
    xpEarned?: number;
    streak?: number;
    difficultyLevel?: number;
    errorPattern?: unknown;
  },
) {
  const score = estimateWritingScore(result);

  return {
    status: 'ok' as const,
    score,
    feedback: {
      corrected_text: result.correctedText,
      grammar_feedback: result.grammarFeedback,
      vocabulary_feedback: result.vocabularyFeedback,
      coherence_feedback: result.coherenceFeedback,
      structure_feedback: result.structureFeedback,
      micro_lesson: result.microLesson,
    },
    suggestions: buildWritingSuggestions(result),
    corrected_text: result.correctedText,
    grammar_feedback: result.grammarFeedback,
    vocabulary_feedback: result.vocabularyFeedback,
    coherence_feedback: result.coherenceFeedback,
    structure_feedback: result.structureFeedback,
    micro_lesson: result.microLesson,
    xp_earned: result.xpEarned ?? 0,
    streak: result.streak ?? 0,
    difficultyLevel: result.difficultyLevel ?? 1,
    errorPattern: result.errorPattern ?? null,
  };
}

function estimateWritingScore(result: SubmitWritingResult): number {
  let score = 70;
  if (!result.coherenceFeedback.startsWith('Add linking')) {
    score += 10;
  }
  if (
    result.structureFeedback.includes('Strong structure') ||
    result.structureFeedback.includes('Good use of paragraphs') ||
    result.structureFeedback.includes('enough development')
  ) {
    score += 10;
  }
  if (result.microLesson == null) {
    score += 10;
  }
  return Math.min(100, score);
}

function buildWritingSuggestions(result: SubmitWritingResult): string[] {
  const suggestions: string[] = [];
  if (result.grammarFeedback) {
    suggestions.push(result.grammarFeedback);
  }
  if (result.vocabularyFeedback) {
    suggestions.push(result.vocabularyFeedback);
  }
  if (result.coherenceFeedback) {
    suggestions.push(result.coherenceFeedback);
  }
  if (result.structureFeedback) {
    suggestions.push(result.structureFeedback);
  }
  return suggestions.filter(Boolean);
}
