import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);

  return {
    items: slice,
    page: safePage,
    limit: safeLimit,
    total: items.length,
    has_more: start + slice.length < items.length,
  };
}

export function resolvePagination(query: PaginationQueryDto): {
  skip: number;
  take: number;
} {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
