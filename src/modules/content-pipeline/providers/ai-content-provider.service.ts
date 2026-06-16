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

  async detectLanguage(text: string): Promise<string> {
    const parsed = await this.createChatCompletion(
      [
        'Detect the language of the user text.',
        'Return JSON only: {"language":"iso639-1 code"}',
        'Supported codes: hi, ar, ta, te, ml, ur, bn, fil, en.',
      ].join(' '),
      JSON.stringify({ text }),
    );
    return typeof parsed.language === 'string' ? parsed.language : 'en';
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string> {
    const parsed = await this.createChatCompletion(
      [
        'Translate the text accurately for English learners.',
        'Return JSON only: {"translation":"string"}',
      ].join(' '),
      JSON.stringify({ text, sourceLang, targetLang }),
    );
    return typeof parsed.translation === 'string' ? parsed.translation : text;
  }

  async explainEnglish(
    question: string,
    context: { translatedQuestion?: string; sourceLanguage?: string } = {},
  ): Promise<{ explanation: string; exampleSentence: string }> {
    const parsed = await this.createChatCompletion(
      [
        'You are a friendly spoken English coach for EngLexa.',
        'Explain how to say or use the phrase in clear, simple English.',
        'Return JSON only:',
        '{"explanation":"string","exampleSentence":"string"}',
      ].join(' '),
      JSON.stringify({
        question,
        translatedQuestion: context.translatedQuestion ?? question,
        sourceLanguage: context.sourceLanguage ?? 'en',
      }),
    );

    return {
      explanation:
        typeof parsed.explanation === 'string'
          ? parsed.explanation
          : 'Here is a clear English explanation for your question.',
      exampleSentence:
        typeof parsed.exampleSentence === 'string'
          ? parsed.exampleSentence
          : 'Practice saying the sentence slowly and clearly.',
    };
  }

  async textToSpeech(text: string, lang: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('AI provider not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TTS_MODEL ?? 'tts-1',
          input: text,
          voice: process.env.OPENAI_TTS_VOICE ?? 'alloy',
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI TTS HTTP ${response.status}: ${errorBody}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      this.logger.debug(`TTS generated for lang=${lang}, bytes=${audioBuffer.length}`);
      return audioBuffer.toString('base64');
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Text-to-speech failed');
    }
  }

  async speechToText(
    audioBase64: string,
    options: { languageHint?: string; mimeType?: string } = {},
  ): Promise<{ text: string; language: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('AI provider not configured');
    }

    try {
      const buffer = Buffer.from(audioBase64, 'base64');
      const mimeType = options.mimeType ?? 'audio/webm';
      const extension = mimeType.includes('wav')
        ? 'wav'
        : mimeType.includes('mpeg') || mimeType.includes('mp3')
          ? 'mp3'
          : 'webm';

      const formData = new FormData();
      formData.append(
        'file',
        new Blob([buffer], { type: mimeType }),
        `recording.${extension}`,
      );
      formData.append('model', process.env.OPENAI_WHISPER_MODEL ?? 'whisper-1');
      if (options.languageHint) {
        formData.append('language', options.languageHint);
      }
      formData.append('response_format', 'json');

      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI STT HTTP ${response.status}: ${errorBody}`);
      }

      const result = (await response.json()) as { text?: string };
      const text = result.text?.trim() ?? '';
      const language = text
        ? await this.detectLanguage(text)
        : (options.languageHint ?? 'en');

      return { text, language };
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Speech-to-text failed');
    }
  }

  async evaluateSpeakingPractice(input: {
    prompt: string;
    userResponse: string;
    level?: string;
    language?: string;
  }) {
    const parsed = await this.createChatCompletion(
      [
        'Evaluate spoken English practice for grammar, pronunciation clarity, and fluency.',
        'Scores are integers 0-100.',
        'Return JSON only:',
        '{"grammarScore":0,"pronunciationScore":0,"fluencyScore":0,"grammarFeedback":"string","pronunciationFeedback":"string","overallFeedback":"string","suggestedImprovement":"string"}',
      ].join(' '),
      JSON.stringify(input),
    );

    return {
      grammarScore: this.toScore(parsed.grammarScore),
      pronunciationScore: this.toScore(parsed.pronunciationScore),
      fluencyScore: this.toScore(parsed.fluencyScore),
      grammarFeedback:
        typeof parsed.grammarFeedback === 'string'
          ? parsed.grammarFeedback
          : 'Keep practicing grammar with short daily sentences.',
      pronunciationFeedback:
        typeof parsed.pronunciationFeedback === 'string'
          ? parsed.pronunciationFeedback
          : 'Focus on clear word endings and steady pacing.',
      overallFeedback:
        typeof parsed.overallFeedback === 'string'
          ? parsed.overallFeedback
          : 'Good effort! Repeat the prompt and aim for smoother delivery.',
      suggestedImprovement:
        typeof parsed.suggestedImprovement === 'string'
          ? parsed.suggestedImprovement
          : 'Say the sentence in three short chunks, then combine them.',
    };
  }

  async generatePracticePrompt(input: { level?: string; language?: string }) {
    const parsed = await this.createChatCompletion(
      [
        'Generate one spoken English practice prompt for EngLexa.',
        'Return JSON only:',
        '{"promptId":"string","prompt":"string","exampleAnswer":"string"}',
      ].join(' '),
      JSON.stringify({
        level: input.level ?? 'beginner',
        language: input.language ?? 'en',
      }),
    );

    return {
      promptId:
        typeof parsed.promptId === 'string'
          ? parsed.promptId
          : randomUUID(),
      prompt:
        typeof parsed.prompt === 'string'
          ? parsed.prompt
          : 'Introduce yourself in one or two sentences.',
      exampleAnswer:
        typeof parsed.exampleAnswer === 'string'
          ? parsed.exampleAnswer
          : 'Hello, my name is Alex. I am learning English every day.',
    };
  }

  async evaluateSpeakingConfidence(text: string) {
    const parsed = await this.createChatCompletion(
      [
        'Evaluate spoken English confidence for EngLexa learners.',
        'Score grammar, pronunciation clarity, fluency, clarity, and confidence markers as integers 0-100.',
        'confidenceMarkers measures hesitation, filler words, and self-assurance in delivery.',
        'Return JSON only:',
        '{"grammarScore":0,"pronunciationScore":0,"fluencyScore":0,"clarityScore":0,"confidenceMarkers":0,"feedback":"string","encouragement":"string"}',
      ].join(' '),
      JSON.stringify({ text }),
    );

    const grammarScore = this.toScore(parsed.grammarScore);
    const pronunciationScore = this.toScore(parsed.pronunciationScore);
    const fluencyScore = this.toScore(parsed.fluencyScore);
    const clarityScore = this.toScore(parsed.clarityScore);
    const confidenceMarkers = this.toScore(parsed.confidenceMarkers);
    const confidenceScore = this.computeWeightedConfidenceScore({
      grammarScore,
      pronunciationScore,
      fluencyScore,
      clarityScore,
      confidenceMarkers,
    });

    return {
      grammarScore,
      pronunciationScore,
      fluencyScore,
      clarityScore,
      confidenceMarkers,
      confidenceScore,
      feedback:
        typeof parsed.feedback === 'string'
          ? parsed.feedback
          : 'Keep practicing with short, clear sentences.',
      encouragement:
        typeof parsed.encouragement === 'string'
          ? parsed.encouragement
          : "You're improving — focus on clarity, not speed.",
    };
  }

  private toScore(value: unknown): number {
    const score = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(score)) {
      return 70;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private computeWeightedConfidenceScore(scores: {
    grammarScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    clarityScore: number;
    confidenceMarkers: number;
  }): number {
    return Math.round(
      scores.grammarScore * 0.25 +
        scores.pronunciationScore * 0.25 +
        scores.fluencyScore * 0.2 +
        scores.clarityScore * 0.15 +
        scores.confidenceMarkers * 0.15,
    );
  }
}
