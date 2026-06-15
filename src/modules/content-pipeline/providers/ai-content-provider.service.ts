import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiContentProvider } from '../../core/ai-content-provider.interface';
import { LlmAiContentProvider } from './llm-ai-content.provider';

type ChatMessage = { role: 'system' | 'user'; content: string };

/**
 * Phase-2C AI content provider.
 * Grammar admin generation delegates to structured templates; vocabulary/speaking
 * use the OpenAI Chat Completions API with JSON output.
 */
@Injectable()
export class AiContentProviderService implements AiContentProvider {
  private readonly logger = new Logger(AiContentProviderService.name);
  private readonly templateProvider = new LlmAiContentProvider();

  async generateTopic(input: {
    slug: string;
    name?: string;
    level?: string;
    description?: string;
    tags?: string[];
  }) {
    return this.templateProvider.generateTopic(input);
  }

  async generateExplanation(input: { topicSlug: string; text?: string }) {
    return this.templateProvider.generateExplanation(input);
  }

  async generateExercises(input: {
    topicId?: string;
    topicSlug: string;
    count?: number;
    level?: string;
  }) {
    return this.templateProvider.generateExercises(input);
  }

  async generateExamples(input: {
    topicId?: string;
    topicSlug: string;
    count?: number;
  }) {
    return this.templateProvider.generateExamples(input);
  }

  async generateVocabulary(input: {
    level: string;
    topic: string;
    userId?: string;
    word?: string;
    count?: number;
  }) {
    const count = Math.min(input.count ?? 3, 10);
    const system = [
      'You generate English vocabulary practice exercises for EngLexa.',
      'Return JSON only with shape:',
      '{"exercises":[{"id":"string","level":"beginner|intermediate|advanced","topic":"string","type":"mcq|fill_in|match","question":"string","options":["string"]|null,"correct_answer":"string","explanation":"string","example_sentence":"string"}]}',
      'Use friendly, clear, supportive tone. fill_in exercises must set options to null.',
    ].join(' ');

    const user = JSON.stringify({
      level: input.level,
      topic: input.topic,
      userId: input.userId ?? 'learner',
      focusWord: input.word ?? null,
      count,
    });

    const parsed = await this.createChatCompletion(system, user);
    const exercises = Array.isArray(parsed.exercises) ? parsed.exercises : [];

    return {
      mode: 'vocabulary-practice',
      exercises: exercises.map((exercise: Record<string, unknown>, index: number) =>
        this.normalizeVocabExercise(exercise, input, index),
      ),
      effectiveLevel: input.level,
      difficultyLevel: 1,
      hasMore: true,
      jsonRemaining: 0,
    };
  }

  async generateSpeaking(input: {
    level: string;
    topic: string;
    userId?: string;
    message?: string;
  }) {
    const system = [
      'You generate English speaking practice content for EngLexa.',
      'Return JSON only with shape:',
      '{"reply":"string","sessionId":"string","confidence":0.0,"prompt":{"id":"string","level":"beginner|intermediate|advanced","topic":"string","prompt":"string","example_answer":"string"}}',
      'reply should coach the learner based on message when provided, otherwise introduce the prompt.',
    ].join(' ');

    const user = JSON.stringify({
      level: input.level,
      topic: input.topic,
      userId: input.userId ?? 'learner',
      message: input.message ?? null,
    });

    const parsed = await this.createChatCompletion(system, user);
    const prompt =
      parsed.prompt && typeof parsed.prompt === 'object'
        ? (parsed.prompt as Record<string, unknown>)
        : {};

    return {
      reply:
        typeof parsed.reply === 'string'
          ? parsed.reply
          : 'Here is your speaking practice prompt.',
      sessionId:
        typeof parsed.sessionId === 'string' ? parsed.sessionId : randomUUID(),
      confidence:
        typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
      prompt: {
        id:
          typeof prompt.id === 'string'
            ? prompt.id
            : `ai_${input.level}_${input.topic}_${Date.now()}`,
        level: input.level,
        topic: input.topic,
        prompt:
          typeof prompt.prompt === 'string'
            ? prompt.prompt
            : `Speak about ${input.topic.replace(/_/g, ' ')}.`,
        example_answer:
          typeof prompt.example_answer === 'string'
            ? prompt.example_answer
            : 'A clear, natural sample answer for the learner.',
      },
    };
  }

  private normalizeVocabExercise(
    exercise: Record<string, unknown>,
    input: { level: string; topic: string; userId?: string },
    index: number,
  ) {
    const type = String(exercise.type ?? 'mcq').toLowerCase();
    const options =
      type === 'fill_in'
        ? null
        : Array.isArray(exercise.options)
          ? exercise.options.map(String)
          : ['Option A', 'Option B', 'Option C'];

    return {
      id:
        typeof exercise.id === 'string'
          ? exercise.id
          : `ai_${input.level}_${input.topic}_${input.userId ?? 'learner'}_${index}`,
      level: String(exercise.level ?? input.level),
      topic: String(exercise.topic ?? input.topic),
      type,
      question:
        typeof exercise.question === 'string'
          ? exercise.question
          : `Choose the best vocabulary answer for ${input.topic.replace(/_/g, ' ')}.`,
      options,
      correct_answer:
        typeof exercise.correct_answer === 'string'
          ? exercise.correct_answer
          : 'answer',
      explanation:
        typeof exercise.explanation === 'string'
          ? exercise.explanation
          : 'Review the example sentence and meaning.',
      example_sentence:
        typeof exercise.example_sentence === 'string'
          ? exercise.example_sentence
          : 'Use this word in a short, natural sentence.',
    };
  }

  private async createChatCompletion(
    system: string,
    user: string,
  ): Promise<Record<string, unknown>> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('AI provider not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ] satisfies ChatMessage[],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI HTTP ${response.status}: ${errorBody}`);
      }

      const result = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty AI response');
      }

      return JSON.parse(content) as Record<string, unknown>;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('AI generation failed');
    }
  }
}
