import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ContentRepository } from '../../core/content-repository.interface';

@Injectable()
export class FileGrammarRepository implements ContentRepository<any> {
  private readonly dataDir = path.join(process.cwd(), 'data', 'grammar');
  private cache: any[] | null = null;

  async getAll(): Promise<any[]> {
    if (this.cache) {
      return this.cache;
    }

    const entries = await fs.readdir(this.dataDir).catch(() => [] as string[]);
    const jsonFiles = entries.filter((name) => name.endsWith('.json'));
    const items: any[] = [];

    for (const file of jsonFiles) {
      const raw = await fs.readFile(path.join(this.dataDir, file), 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        items.push(...parsed);
      }
    }

    this.cache = items;
    return items;
  }

  async getById(id: string): Promise<any | null> {
    const items = await this.getAll();
    return items.find((item) => item?.id === id) ?? null;
  }

  async filter(predicate: (item: any) => boolean): Promise<any[]> {
    const items = await this.getAll();
    return items.filter(predicate);
  }
}
