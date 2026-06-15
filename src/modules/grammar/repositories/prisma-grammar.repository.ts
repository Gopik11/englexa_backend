import { Injectable } from '@nestjs/common';
import { ContentRepository } from '../../core/content-repository.interface';

/** Phase 2 placeholder — no DB access in Phase 1. */
@Injectable()
export class PrismaGrammarRepository implements ContentRepository<any> {
  async getAll(): Promise<any[]> {
    throw new Error('PrismaGrammarRepository not implemented in Phase 1');
  }

  async getById(_id: string): Promise<any | null> {
    throw new Error('PrismaGrammarRepository not implemented in Phase 1');
  }

  async filter(_predicate: (item: any) => boolean): Promise<any[]> {
    throw new Error('PrismaGrammarRepository not implemented in Phase 1');
  }
}
