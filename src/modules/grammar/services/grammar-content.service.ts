import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { LearnerLevel } from '../../../content/englexa-content-spec.constants';
import {
  GrammarExercise,
  GrammarTopic,
} from '../../../grammar-practice/interfaces/grammar-exercise.interface';
import { loadGrammarExercises } from '../../../grammar-practice/utils/content-loader';
import { FileGrammarRepository } from '../repositories/file-grammar.repository';

@Injectable()
export class GrammarContentService {
  private readonly grammarPracticeDir = path.join(__dirname, '../../../grammar-practice');

  constructor(private readonly fileRepository: FileGrammarRepository) {}

  /** Preserves grammar-practice adaptive flow (file-based, unchanged). */
  loadExercises(level: LearnerLevel, topic: GrammarTopic): GrammarExercise[] {
    return loadGrammarExercises(level, topic, this.grammarPracticeDir);
  }

  async getTopics(): Promise<any[]> {
    const items = await this.fileRepository.getAll();
    return items.filter((item) => item.topicId === undefined && item.level !== undefined);
  }

  async getExercises(topicId: string): Promise<any[]> {
    return this.fileRepository.filter((item) => item.topicId === topicId);
  }

  async getExamples(topicId: string): Promise<any[]> {
    const items = await this.fileRepository.getAll();
    return items.filter((item) => item.topicId === topicId && item.sentence !== undefined);
  }

  async getAllExercises(): Promise<any[]> {
    return this.fileRepository.filter((item) => item.topicId !== undefined && item.question !== undefined);
  }
}
