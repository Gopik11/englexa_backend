import { ErrorPatternModule } from '../entities/error-pattern.entity';

export function createMockErrorPatternsService() {
  return {
    detectErrorPattern: jest.fn().mockReturnValue({
      module: 'grammar' as ErrorPatternModule,
      concept: 'articles',
      error_type: 'missing_article',
    }),
    recordErrorPattern: jest.fn().mockResolvedValue({
      userId: 'user-1',
      module: 'grammar',
      concept: 'articles',
      error_type: 'missing_article',
      count: 1,
      last_seen: new Date(),
      examples: ['a book'],
    }),
    detectAndRecord: jest.fn().mockResolvedValue({
      userId: 'user-1',
      module: 'grammar',
      concept: 'articles',
      error_type: 'missing_article',
      count: 1,
      last_seen: new Date(),
      examples: ['a book'],
    }),
    getTopErrorPatterns: jest.fn().mockResolvedValue([]),
    getErrorProfile: jest.fn().mockResolvedValue({
      userId: 'user-1',
      total_patterns: 0,
      total_errors: 0,
      by_module: {},
      top_patterns: [],
    }),
  };
}
