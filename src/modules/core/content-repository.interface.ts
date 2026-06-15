/**
 * Contract for file-based and DB-based content repositories.
 * Phase 1: file-based repositories only.
 */
export interface ContentRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  filter(predicate: (item: T) => boolean): Promise<T[]>;
}
