import { Injectable } from '@nestjs/common';
import { GRAMMAR_TOPICS_BY_LEVEL } from '../../../content/grammar-topics.constants';
import {
  GrammarTopicRecord,
  GrammarTopicRepository,
} from '../../core/interfaces/content-repository.interface';
import { PracticeLevel } from '../../core/types/practice-level.type';
import { slugToDisplayName } from '../utils/slug-utils';

@Injectable()
export class FileGrammarTopicRepository implements GrammarTopicRepository {
  async listByLevel(level?: PracticeLevel): Promise<GrammarTopicRecord[]> {
    const levels = level ? [level] : (Object.keys(GRAMMAR_TOPICS_BY_LEVEL) as PracticeLevel[]);
    return levels.flatMap((lvl) =>
      GRAMMAR_TOPICS_BY_LEVEL[lvl].map((slug, index) => this.toRecord(slug, lvl, index)),
    );
  }

  async findBySlug(slug: string): Promise<GrammarTopicRecord | null> {
    for (const level of Object.keys(GRAMMAR_TOPICS_BY_LEVEL) as PracticeLevel[]) {
      if ((GRAMMAR_TOPICS_BY_LEVEL[level] as readonly string[]).includes(slug)) {
        return this.toRecord(slug, level, 0);
      }
    }
    return null;
  }

  private toRecord(slug: string, level: PracticeLevel, _sortOrder: number): GrammarTopicRecord {
    return {
      id: slug,
      slug,
      name: slugToDisplayName(slug),
      level,
      tags: [],
      description: null,
    };
  }
}
