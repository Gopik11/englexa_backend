import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { ConversationIntent } from '../entities/conversation-session.entity';

interface ResponseContext {
  intent: ConversationIntent;
  difficulty: number;
  userMessage: string;
  level: LearnerLevel;
  grammarCorrections: string[];
}

const FOLLOW_UPS: Record<ConversationIntent, string[]> = {
  greeting: [
    'What would you like to talk about today?',
    'How has your day been so far?',
  ],
  help_request: [
    'Would you like an example sentence to practise?',
    'Which part feels hardest — grammar or vocabulary?',
  ],
  opinion: [
    'What made you feel that way?',
    'Can you give one reason for your opinion?',
  ],
  storytelling: [
    'What happened next?',
    'How did you feel at the end of that story?',
  ],
  daily_conversation: [
    'Tell me a little more about that.',
    'What do you usually do in that situation?',
  ],
  travel: [
    'Where would you like to travel next?',
    'What do you enjoy most when you visit a new place?',
  ],
  work: [
    'What do you like most about your work?',
    'What skill would help you most at work?',
  ],
  study: [
    'What are you studying right now?',
    'How do you like to practise English?',
  ],
  shopping: [
    'What do you usually buy online?',
    'Do you prefer big stores or small shops?',
  ],
  food: [
    'What is your favourite dish?',
    'Do you like cooking at home?',
  ],
  hobbies: [
    'How often do you do that in your free time?',
    'Who do you usually do it with?',
  ],
};

const OPENERS: Record<ConversationIntent, string[]> = {
  greeting: [
    'Hi! Great to chat with you.',
    'Hello! I am happy to practise with you.',
  ],
  help_request: [
    'Good question — let us work through it together.',
    'I am here to help.',
  ],
  opinion: [
    'That is an interesting point.',
    'Thanks for sharing your view.',
  ],
  storytelling: [
    'I enjoyed hearing that.',
    'That sounds like a memorable moment.',
  ],
  daily_conversation: [
    'Nice — tell me more.',
    'That sounds good.',
  ],
  travel: [
    'Travel stories are always fun to hear.',
    'I love talking about trips.',
  ],
  work: [
    'Work life gives us lots to talk about.',
    'That is a useful topic to practise.',
  ],
  study: [
    'Learning English takes steady practice — you are doing well.',
    'Studying regularly really helps.',
  ],
  shopping: [
    'Shopping is great everyday English practice.',
    'Useful topic for real conversations.',
  ],
  food: [
    'Food is one of my favourite topics.',
    'Yum — food chat is always fun.',
  ],
  hobbies: [
    'Hobbies make conversations lively.',
    'It is great to talk about what you enjoy.',
  ],
};

export function generateResponse(context: ResponseContext): string {
  const opener = pickLine(OPENERS[context.intent], context.userMessage);
  const followUp = pickLine(FOLLOW_UPS[context.intent], context.userMessage);
  const parts: string[] = [opener];

  if (context.grammarCorrections.length > 0 && context.difficulty <= 3) {
    const tip = context.grammarCorrections[0]!;
    parts.push(`Small tip: ${tip}`);
  } else if (context.grammarCorrections.length > 0) {
    parts.push('Your meaning was clear — watch small grammar details as you go.');
  }

  parts.push(followUp);

  return parts.slice(0, 3).join(' ');
}

export function generateWelcomeMessage(level: LearnerLevel): string {
  switch (level) {
    case 'beginner':
      return 'Hi! I am your speaking partner. Tell me about your day, or tap the mic to practise with your voice.';
    case 'advanced':
      return 'Hello! Ready for a natural conversation? Share an opinion, tell a story, or ask me anything in English.';
    default:
      return 'Hi! Let us practise English together. Type or record a message — I will reply and give gentle feedback.';
  }
}

export function generateSessionSummary(
  messageCount: number,
  analysis: {
    grammar_errors: string[];
    vocabulary_suggestions: string[];
    pronunciation_score?: number;
    fluency_score?: number;
  },
): string {
  const lines: string[] = [
    `You exchanged ${messageCount} messages in this conversation.`,
  ];

  if (analysis.pronunciation_score != null) {
    lines.push(`Average pronunciation: ${analysis.pronunciation_score}%.`);
  }
  if (analysis.fluency_score != null) {
    lines.push(`Fluency score: ${analysis.fluency_score}%.`);
  }
  if (analysis.grammar_errors.length > 0) {
    lines.push(
      `Grammar focus: ${analysis.grammar_errors.slice(0, 2).join('; ')}.`,
    );
  } else {
    lines.push('Your grammar was clear throughout the session.');
  }
  if (analysis.vocabulary_suggestions.length > 0) {
    lines.push(
      `Try using: ${analysis.vocabulary_suggestions.slice(0, 2).join(', ')}.`,
    );
  }

  lines.push('Keep practising a few minutes each day — consistency builds fluency.');
  return lines.join(' ');
}

function pickLine(options: string[], seed: string): string {
  if (options.length === 0) return '';
  const hash = hashSeed(seed);
  return options[hash % options.length]!;
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
