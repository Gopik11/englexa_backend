import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type ConversationSessionDelegate = {
  create: (args: {
    data: {
      userId: string;
      status: string;
      messages: unknown;
      analysis: unknown;
      summary: string;
    };
  }) => Promise<{
    id: string;
    userId: string;
    status: string;
    messages: unknown;
    analysis: unknown;
    summary: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  findFirst: (args: {
    where: { id: string; userId: string };
  }) => Promise<{
    id: string;
    userId: string;
    status: string;
    messages: unknown;
    analysis: unknown;
    summary: string;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  update: (args: {
    where: { id: string };
    data: {
      status?: string;
      messages?: unknown;
      analysis?: unknown;
      summary?: string;
    };
  }) => Promise<{
    id: string;
    userId: string;
    status: string;
    messages: unknown;
    analysis: unknown;
    summary: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export function conversationSessionClient(
  prisma: PrismaService | PrismaClient,
): ConversationSessionDelegate {
  return (prisma as PrismaClient & {
    conversationSession: ConversationSessionDelegate;
  }).conversationSession;
}
