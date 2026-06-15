import { Injectable, Logger } from '@nestjs/common';
import { PracticeLevel } from '@prisma/client';

/** LLM wrapper — uses structured templates when no external API key is configured. */
@Injectable()
export class LlmAiContentProvider {
  private readonly logger = new Logger(LlmAiContentProvider.name);

  async generateTopic(input: {
    slug: string;
    name?: string;
    level?: string;
    description?: string;
    tags?: string[];
  }) {
    this.logger.debug(`generateTopic: ${input.slug}`);
    return {
      slug: input.slug,
      name: input.name ?? this.slugToName(input.slug),
      level: this.normalizeLevel(input.level),
      tags: input.tags ?? ['grammar', 'ai-generated'],
      description:
        input.description ?? `AI-generated grammar topic covering ${input.slug.replace(/_/g, ' ')}.`,
      isPublished: false,
    };
  }

  async generateExplanation(input: { topicSlug: string; text?: string }) {
    return {
      topicSlug: input.topicSlug,
      explanation:
        input.text ??
        `This topic focuses on ${input.topicSlug.replace(/_/g, ' ')} usage in everyday English.`,
    };
  }

  async generateExercises(input: {
    topicId?: string;
    topicSlug: string;
    count?: number;
    level?: string;
  }) {
    const count = Math.min(input.count ?? 3, 10);
    const exercises = [];
    for (let i = 1; i <= count; i += 1) {
      exercises.push({
        legacyId: `ai_${input.topicSlug}_${i}`,
        topicSlug: input.topicSlug,
        topicId: input.topicId ?? null,
        type: 'MCQ',
        question: `Choose the correct form for ${input.topicSlug.replace(/_/g, ' ')} (Q${i}).`,
        optionsJson: ['Option A', 'Option B', 'Option C'],
        answerJson: { correct_answer: 'Option A' },
        explanation: 'AI-generated exercise (review before publish).',
        difficulty: 1,
        level: this.normalizeLevel(input.level),
      });
    }
    return exercises;
  }

  async generateExamples(input: { topicId?: string; topicSlug: string; count?: number }) {
    const count = Math.min(input.count ?? 2, 10);
    const examples = [];
    for (let i = 1; i <= count; i += 1) {
      examples.push({
        topicSlug: input.topicSlug,
        topicId: input.topicId ?? null,
        sentence: `Example sentence ${i} for ${input.topicSlug.replace(/_/g, ' ')}.`,
        highlight: 'Example',
        note: 'AI-generated example (review before publish).',
      });
    }
    return examples;
  }

  private slugToName(slug: string): string {
    return slug
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private normalizeLevel(level?: string): PracticeLevel {
    const value = (level ?? 'beginner').trim().toUpperCase();
    if (value === 'INTERMEDIATE') return PracticeLevel.INTERMEDIATE;
    if (value === 'ADVANCED') return PracticeLevel.ADVANCED;
    return PracticeLevel.BEGINNER;
  }
}
