import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { GRAMMAR_TOPICS_BY_LEVEL } from '../../../content/grammar-topics.constants';
import { LearnerLevel } from '../../../content/englexa-content-spec.constants';
import {
  GrammarExercise,
  GrammarTopic,
} from '../../../grammar-practice/interfaces/grammar-exercise.interface';
import { loadGrammarExercises } from '../../../grammar-practice/utils/content-loader';
import { toPublicExercise } from '../../../grammar-practice/utils/exercise-helpers';
import { GrammarTopicRecord } from '../../core/interfaces/content-repository.interface';
import { PracticeLevel } from '../../core/types/practice-level.type';
import { FileGrammarExerciseRepository } from '../repositories/file-grammar-exercise.repository';
import { FileGrammarTopicRepository } from '../repositories/file-grammar-topic.repository';
import { normalizePracticeLevel, normalizeTopicSlug } from '../utils/slug-utils';

@Injectable()
export class GrammarContentService {
  private readonly moduleDir = path.join(__dirname, '../../../grammar-practice');

  constructor(
    private readonly topicRepo: FileGrammarTopicRepository,
    private readonly exerciseRepo: FileGrammarExerciseRepository,
  ) {}

  /** Used by GrammarPracticeService adaptive flow (Phase 1 file source). */
  loadExercises(level: LearnerLevel, topic: GrammarTopic): GrammarExercise[] {
    return loadGrammarExercises(level, topic, this.moduleDir);
  }

  async listTopicsByLevel(): Promise<Record<PracticeLevel, GrammarTopicRecord[]>> {
    const result = {} as Record<PracticeLevel, GrammarTopicRecord[]>;
    for (const level of Object.keys(GRAMMAR_TOPICS_BY_LEVEL) as PracticeLevel[]) {
      result[level] = (await this.topicRepo.listByLevel(level)).filter((t) => t.level === level);
    }
    return result;
  }

  async listExercises(query: {
    level?: string;
    topicId?: string;
    topic?: string;
    difficulty?: number;
  }) {
    const level = query.level ? normalizePracticeLevel(query.level) : null;
    const slug = normalizeTopicSlug(query.topicId ?? query.topic ?? '');
    if (!level || !slug) {
      throw new BadRequestException('level and topicId (or topic) are required');
    }
    await this.assertTopic(level, slug);
    const exercises = (await this.exerciseRepo.findByTopic(level, slug)) as GrammarExercise[];
    return exercises.map((e) => toPublicExercise(e));
  }

  async listExamples(topicId: string) {
    if (!normalizeTopicSlug(topicId)) {
      throw new BadRequestException('topicId is required');
    }
    return [];
  }

  private async assertTopic(level: PracticeLevel, slug: string): Promise<void> {
    const topic = await this.topicRepo.findBySlug(slug);
    if (!topic || topic.level !== level) {
      throw new NotFoundException(`Topic "${slug}" not found for level "${level}"`);
    }
  }
}
