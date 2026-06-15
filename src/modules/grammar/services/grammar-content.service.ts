import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { LearnerLevel } from '../../../content/englexa-content-spec.constants';
import {
  GrammarExercise,
  GrammarTopic,
} from '../../../grammar-practice/interfaces/grammar-exercise.interface';
import { loadGrammarExercises } from '../../../grammar-practice/utils/content-loader';
import {
  GrammarExampleRecord,
  GrammarExerciseRecord,
  GrammarTopicRecord,
} from '../../core/grammar-repository.interface';
import { PrismaGrammarExampleRepository } from '../repositories/prisma-grammar-example.repository';
import { PrismaGrammarExerciseRepository } from '../repositories/prisma-grammar-exercise.repository';
import { PrismaGrammarHistoryRepository } from '../repositories/prisma-grammar-history.repository';
import { PrismaGrammarTopicRepository } from '../repositories/prisma-grammar-topic.repository';

@Injectable()
export class GrammarContentService {
  private readonly grammarPracticeDir = path.join(__dirname, '../../../grammar-practice');

  constructor(
    private readonly topicRepository: PrismaGrammarTopicRepository,
    private readonly exerciseRepository: PrismaGrammarExerciseRepository,
    private readonly exampleRepository: PrismaGrammarExampleRepository,
    private readonly historyRepository: PrismaGrammarHistoryRepository,
  ) {}

  /** Preserves grammar-practice adaptive flow (file-based, unchanged). */
  loadExercises(level: LearnerLevel, topic: GrammarTopic): GrammarExercise[] {
    return loadGrammarExercises(level, topic, this.grammarPracticeDir);
  }

  async getTopics(): Promise<any[]> {
    const topics = await this.topicRepository.findAllPublished();
    return topics.map((topic) => this.toTopicDto(topic));
  }

  async getExercises(topicSlug: string): Promise<any[]> {
    const topic = await this.resolvePublishedTopic(topicSlug);
    if (!topic) {
      return [];
    }
    const exercises = await this.getLatestPublishedExercises(topic.id);
    return exercises.map((exercise) => this.toExerciseDto(exercise, topic.slug));
  }

  async getExamples(topicSlug: string): Promise<any[]> {
    const topic = await this.resolvePublishedTopic(topicSlug);
    if (!topic) {
      return [];
    }
    const examples = await this.getLatestPublishedExamples(topic.id);
    return examples.map((example) => this.toExampleDto(example, topic.slug));
  }

  async getAllExercises(): Promise<any[]> {
    const topics = await this.getTopics();
    const merged: any[] = [];
    for (const topic of topics) {
      const slug = (topic.slug as string | undefined) ?? (topic.id as string);
      merged.push(...(await this.getExercises(slug)));
    }
    return merged;
  }

  async getLatestVersion(topicIdOrSlug: string): Promise<number> {
    const topic = await this.resolvePublishedTopic(topicIdOrSlug);
    if (!topic) {
      return 0;
    }
    const latest = await this.historyRepository.getLatestTopicVersion(topic.id);
    return latest?.version ?? 0;
  }

  async getPublishedContent(topicIdOrSlug: string) {
    const topic = await this.resolvePublishedTopic(topicIdOrSlug);
    if (!topic) {
      return null;
    }
    return {
      topic: this.toTopicDto(topic),
      exercises: (await this.getLatestPublishedExercises(topic.id)).map((exercise) =>
        this.toExerciseDto(exercise, topic.slug),
      ),
      examples: (await this.getLatestPublishedExamples(topic.id)).map((example) =>
        this.toExampleDto(example, topic.slug),
      ),
      version: topic.version,
    };
  }

  async getLatestPublishedTopic(topicIdOrSlug: string): Promise<GrammarTopicRecord> {
    const topic = await this.resolvePublishedTopic(topicIdOrSlug);
    if (!topic) {
      throw new NotFoundException(`Grammar topic not found: ${topicIdOrSlug}`);
    }
    return topic;
  }

  async getLatestPublishedExercises(topicId: string): Promise<GrammarExerciseRecord[]> {
    return this.exerciseRepository.findPublishedByTopicId(topicId);
  }

  async getLatestPublishedExamples(topicId: string): Promise<GrammarExampleRecord[]> {
    return this.exampleRepository.findPublishedByTopicId(topicId);
  }

  private async resolvePublishedTopic(
    topicIdOrSlug: string,
  ): Promise<GrammarTopicRecord | null> {
    const bySlug = await this.topicRepository.findBySlug(topicIdOrSlug);
    if (bySlug?.isPublished) {
      return bySlug;
    }
    const byId = await this.topicRepository.findById(topicIdOrSlug);
    if (byId?.isPublished) {
      return byId;
    }
    return null;
  }

  private toTopicDto(topic: GrammarTopicRecord) {
    return {
      id: topic.slug,
      slug: topic.slug,
      name: topic.name,
      level: topic.level.toLowerCase(),
      tags: topic.tags,
      description: topic.description,
      version: topic.version,
    };
  }

  private toExerciseDto(exercise: GrammarExerciseRecord, topicSlug: string) {
    const answerJson =
      exercise.answerJson && typeof exercise.answerJson === 'object'
        ? (exercise.answerJson as Record<string, unknown>)
        : {};
    const optionsJson = Array.isArray(exercise.optionsJson)
      ? exercise.optionsJson
      : null;

    return {
      id: exercise.legacyId ?? exercise.id,
      topicId: topicSlug,
      type: exercise.type.toLowerCase(),
      question: exercise.question,
      options: optionsJson,
      explanation: exercise.explanation ?? undefined,
      difficulty: exercise.difficulty,
      source: 'database',
      ...answerJson,
    };
  }

  private toExampleDto(example: GrammarExampleRecord, topicSlug: string) {
    return {
      id: example.id,
      topicId: topicSlug,
      sentence: example.sentence,
      highlight: example.highlight,
      note: example.note,
      source: 'database',
    };
  }
}
