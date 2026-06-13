import { PrismaService } from '../../prisma/prisma.service';

export interface ErrorPatternRow {
  id: string;
  userId: string;
  module: string;
  concept: string;
  errorType: string;
  count: number;
  lastSeenAt: Date;
  examples: string[];
}

type ErrorPatternClient = {
  findMany: (args: {
    where: { userId: string; module?: string };
    orderBy?: { count: 'desc' } | { lastSeenAt: 'desc' };
    take?: number;
  }) => Promise<ErrorPatternRow[]>;
  findUnique: (args: {
    where: {
      userId_module_concept_errorType: {
        userId: string;
        module: string;
        concept: string;
        errorType: string;
      };
    };
  }) => Promise<ErrorPatternRow | null>;
  upsert: (args: {
    where: {
      userId_module_concept_errorType: {
        userId: string;
        module: string;
        concept: string;
        errorType: string;
      };
    };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<ErrorPatternRow>;
};

export function errorPatternClient(prisma: PrismaService): ErrorPatternClient {
  return (prisma as unknown as { errorPattern: ErrorPatternClient }).errorPattern;
}
