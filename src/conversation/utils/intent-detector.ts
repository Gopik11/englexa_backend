import { ConversationIntent } from '../entities/conversation-session.entity';

interface IntentRule {
  intent: ConversationIntent;
  patterns: RegExp[];
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'greeting',
    patterns: [
      /\b(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy)\b/i,
      /\bhow\s+are\s+you\b/i,
    ],
  },
  {
    intent: 'help_request',
    patterns: [
      /\b(help|explain|what\s+does|how\s+do\s+i|can\s+you\s+teach)\b/i,
      /\b(i\s+don'?t\s+understand|confused|stuck)\b/i,
    ],
  },
  {
    intent: 'opinion',
    patterns: [
      /\b(i\s+think|in\s+my\s+opinion|i\s+believe|i\s+feel\s+that)\b/i,
      /\b(agree|disagree|prefer|better\s+than)\b/i,
    ],
  },
  {
    intent: 'storytelling',
    patterns: [
      /\b(once|yesterday|last\s+week|when\s+i\s+was|story|happened)\b/i,
      /\b(then|after\s+that|suddenly|finally)\b/i,
    ],
  },
  {
    intent: 'travel',
    patterns: [
      /\b(travel|trip|flight|airport|hotel|vacation|holiday|passport)\b/i,
      /\b(visit|tourist|abroad|country|city)\b/i,
    ],
  },
  {
    intent: 'work',
    patterns: [
      /\b(work|job|office|meeting|colleague|boss|project|deadline)\b/i,
      /\b(career|interview|salary|remote)\b/i,
    ],
  },
  {
    intent: 'study',
    patterns: [
      /\b(study|learn|school|university|class|exam|homework|teacher)\b/i,
      /\b(practise|practice|lesson|course)\b/i,
    ],
  },
  {
    intent: 'shopping',
    patterns: [
      /\b(shop|buy|store|market|price|discount|receipt)\b/i,
      /\b(shopping|mall|online\s+order)\b/i,
    ],
  },
  {
    intent: 'food',
    patterns: [
      /\b(food|eat|restaurant|cook|recipe|breakfast|lunch|dinner)\b/i,
      /\b(hungry|tasty|delicious|meal|coffee|tea)\b/i,
    ],
  },
  {
    intent: 'hobbies',
    patterns: [
      /\b(hobby|hobbies|music|sport|game|read|paint|garden|run)\b/i,
      /\b(weekend|free\s+time|enjoy\s+doing)\b/i,
    ],
  },
];

export function detectIntent(text: string): ConversationIntent {
  const normalized = text.trim();
  if (!normalized) {
    return 'daily_conversation';
  }

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.intent;
    }
  }

  return 'daily_conversation';
}
