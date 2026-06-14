import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { loadGrammarExercises } from '../../../grammar-practice/utils/content-loader';
import {
  GrammarExercise,
  GrammarTopic,
} from '../../../grammar-practice/interfaces/grammar-exercise.interface';
import { GrammarExerciseRepository } from '../../core/interfaces/content-repository.interface';
import { PracticeLevel } from '../../core/types/practice-level.type';

@Injectable()
export class FileGrammarExerciseRepository implements GrammarExerciseRepository {
  private readonly moduleDir = path.join(__dirname, '../../../grammar-practice');

  async findByTopic(level: PracticeLevel, topicSlug: string): Promise<GrammarExercise[]> {
    return loadGrammarExercises(level, topicSlug as GrammarTopic, this.moduleDir);
  }
}
