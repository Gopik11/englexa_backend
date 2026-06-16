import { Prisma } from '@prisma/client';

const CONNECTION_ERROR_CODES = new Set([
  'P1000',
  'P1001',
  'P1002',
  'P1003',
  'P1017',
]);

const SCHEMA_ERROR_CODES = new Set(['P2021', 'P2022']);

export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTION_ERROR_CODES.has(error.code);
  }

  return false;
}

export function isPrismaSchemaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    SCHEMA_ERROR_CODES.has(error.code)
  );
}

export function isPrismaForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
  );
}

export function formatPrismaError(error: unknown): {
  code: string;
  message: string;
  meta?: unknown;
} {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: 'P1001',
      message: error.message,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      code: error.code,
      message: error.message,
      meta: error.meta,
    };
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      code: 'PRISMA_PANIC',
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'An unexpected database error occurred',
  };
}

export const DATABASE_UNAVAILABLE_CODE = 'DATABASE_UNAVAILABLE';
export const DATABASE_UNAVAILABLE_MESSAGE =
  'Database is temporarily unavailable. Please try again later.';

export const DATABASE_SCHEMA_OUTDATED_CODE = 'DATABASE_SCHEMA_OUTDATED';
export const DATABASE_SCHEMA_OUTDATED_MESSAGE =
  'Database schema is out of date. Run prisma migrate deploy.';
