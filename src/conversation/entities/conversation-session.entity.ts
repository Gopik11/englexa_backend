export type ConversationSender = 'user' | 'ai';

export type ConversationIntent =
  | 'greeting'
  | 'help_request'
  | 'opinion'
  | 'storytelling'
  | 'daily_conversation'
  | 'travel'
  | 'work'
  | 'study'
  | 'shopping'
  | 'food'
  | 'hobbies';

export interface ConversationMessage {
  sender: ConversationSender;
  text: string;
  audioUrl?: string;
  timestamp: Date;
}

export interface ConversationAnalysis {
  grammar_errors: string[];
  vocabulary_suggestions: string[];
  pronunciation_score?: number;
  fluency_score?: number;
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  messages: ConversationMessage[];
  analysis: ConversationAnalysis;
  summary: string;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageInput {
  sessionId: string;
  text?: string;
  audioBlobRef?: string;
  audioUrl?: string;
}

export interface SendMessageResult {
  session: ConversationSession;
  aiReply: string;
  intent: ConversationIntent;
  pronunciationScore?: number;
  fluencyScore?: number;
  grammarCorrections: string[];
  vocabularySuggestions: string[];
}
