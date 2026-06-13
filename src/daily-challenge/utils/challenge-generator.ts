import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { pickDailyIndex } from '../../home/utils/daily-seed';
import { generateLesson } from '../../mini-lessons/utils/lesson-generator';
import {
  ChallengeModule,
  ChallengePayload,
  ChallengeSource,
} from '../entities/daily-challenge.entity';

export const ERROR_PATTERN_THRESHOLD = 3;

const LEVEL_MODULES: Record<LearnerLevel, ChallengeModule[]> = {
  beginner: ['grammar', 'vocabulary', 'reading'],
  intermediate: ['grammar', 'vocabulary', 'reading', 'writing'],
  advanced: ['grammar', 'vocabulary', 'reading', 'speaking', 'writing'],
};

const READING_MICRO: Array<{
  concept: string;
  passage: string;
  question: string;
  options: string[];
  answer: string;
}> = [
  {
    concept: 'inference',
    passage:
      'Tom checked the dark clouds and grabbed his raincoat before leaving.',
    question: 'Why did Tom take a raincoat?',
    options: ['It was cold', 'It might rain', 'He lost his umbrella', 'He was late'],
    answer: 'It might rain',
  },
  {
    concept: 'detail',
    passage: 'The café opens at 7 a.m. and closes at 9 p.m. on weekdays.',
    question: 'When does the café close on weekdays?',
    options: ['7 a.m.', '9 p.m.', 'Noon', 'Midnight'],
    answer: '9 p.m.',
  },
  {
    concept: 'vocabulary_in_context',
    passage: 'She was elated when she heard the good news.',
    question: 'What does "elated" mean in this sentence?',
    options: ['Tired', 'Very happy', 'Confused', 'Angry'],
    answer: 'Very happy',
  },
];

const SPEAKING_PROMPTS: Array<{
  concept: string;
  prompt: string;
  answer: string;
}> = [
  {
    concept: 'fluency_patterns',
    prompt: 'Describe your morning routine in 2–3 sentences.',
    answer: 'routine|morning|wake|breakfast',
  },
  {
    concept: 'pronunciation_patterns',
    prompt: 'Say aloud: "The weather will be better tomorrow."',
    answer: 'weather|tomorrow',
  },
];

const WRITING_TASKS: Array<{
  concept: string;
  prompt: string;
  answer: string;
}> = [
  {
    concept: 'coherence',
    prompt: 'Write 1–2 sentences about your favourite hobby.',
    answer: 'hobby|enjoy|like',
  },
  {
    concept: 'structure',
    prompt: 'Write a topic sentence about healthy eating.',
    answer: 'healthy|eat|food|diet',
  },
  {
    concept: 'grammar_patterns',
    prompt: 'Fix this sentence: "She go to school every day."',
    answer: 'goes',
  },
];

const VOCAB_TASKS: Array<{
  concept: string;
  kind: 'synonym' | 'antonym' | 'collocation';
  question: string;
  options: string[];
  answer: string;
}> = [
  {
    concept: 'synonyms',
    kind: 'synonym',
    question: 'Choose the synonym of "rapid".',
    options: ['slow', 'quick', 'heavy', 'quiet'],
    answer: 'quick',
  },
  {
    concept: 'antonyms',
    kind: 'antonym',
    question: 'Choose the antonym of "generous".',
    options: ['kind', 'selfish', 'brave', 'calm'],
    answer: 'selfish',
  },
  {
    concept: 'collocations',
    kind: 'collocation',
    question: 'Complete the collocation: make a ___',
    options: ['decision', 'decide', 'deciding', 'decided'],
    answer: 'decision',
  },
];

export interface ChallengeGeneratorContext {
  userId: string;
  userLevel: LearnerLevel;
  srsDue: { module: string; concept: string } | null;
  topError: { module: string; concept: string; count: number } | null;
  predictionDifficulty: number;
  weakest: { module: string; concept: string; masteryScore: number } | null;
}

export interface ChallengeTarget {
  module: ChallengeModule;
  concept: string;
  difficulty: number;
  source: ChallengeSource;
}

export function selectChallengeTarget(
  ctx: ChallengeGeneratorContext,
): ChallengeTarget {
  if (ctx.srsDue) {
    return {
      module: normalizeModule(ctx.srsDue.module),
      concept: ctx.srsDue.concept,
      difficulty: clampDifficulty(ctx.predictionDifficulty || 2),
      source: 'srs_review',
    };
  }

  if (ctx.topError && ctx.topError.count >= ERROR_PATTERN_THRESHOLD) {
    return {
      module: normalizeModule(ctx.topError.module),
      concept: ctx.topError.concept,
      difficulty: clampDifficulty(Math.max(2, ctx.predictionDifficulty || 2)),
      source: 'weak_area',
    };
  }

  return pickRandomTarget(ctx);
}

export function buildChallengeContent(
  target: ChallengeTarget,
  userId: string,
): ChallengePayload {
  switch (target.module) {
    case 'reading':
      return buildReadingChallenge(target, userId);
    case 'speaking':
      return buildSpeakingChallenge(target, userId);
    case 'writing':
      return buildWritingChallenge(target, userId);
    case 'vocabulary':
      return buildVocabularyChallenge(target, userId);
    case 'grammar':
    default:
      return buildGrammarChallenge(target);
  }
}

export function generateChallenge(
  ctx: ChallengeGeneratorContext,
): ChallengePayload {
  const target = selectChallengeTarget(ctx);
  const challenge = buildChallengeContent(target, ctx.userId);
  return { ...challenge, source: target.source };
}

function pickRandomTarget(ctx: ChallengeGeneratorContext): ChallengeTarget {
  const modules = LEVEL_MODULES[ctx.userLevel] ?? LEVEL_MODULES.beginner;
  const moduleIndex = pickDailyIndex(ctx.userId, 'daily-challenge-module', modules.length);
  const module = modules[moduleIndex] ?? 'grammar';

  const concept =
    ctx.weakest && ctx.weakest.module === module
      ? ctx.weakest.concept
      : pickConceptForModule(module, ctx.userId);

  return {
    module,
    concept,
    difficulty: clampDifficulty(ctx.predictionDifficulty || levelBaseDifficulty(ctx.userLevel)),
    source: 'daily_random',
  };
}

function buildGrammarChallenge(target: ChallengeTarget): ChallengePayload {
  const lesson = generateLesson(target.concept, target.difficulty, 'grammar');
  const practice =
    lesson.quick_practice[pickDailyIndex(target.concept, 'grammar-q', lesson.quick_practice.length)] ??
    lesson.quick_practice[0];

  return {
    type: 'grammar',
    concept: target.concept,
    difficulty: target.difficulty,
    question: practice?.question ?? `Practise ${target.concept.replace(/_/g, ' ')}.`,
    options: practice?.options,
    answer: practice?.answer,
  };
}

function buildVocabularyChallenge(
  target: ChallengeTarget,
  userId: string,
): ChallengePayload {
  const matching = VOCAB_TASKS.filter((item) => item.concept === target.concept);
  const pool = matching.length > 0 ? matching : VOCAB_TASKS;
  const task = pool[pickDailyIndex(userId, `vocab-${target.concept}`, pool.length)] ?? pool[0];

  return {
    type: 'vocabulary',
    concept: target.concept,
    difficulty: target.difficulty,
    question: task.question,
    options: task.options,
    answer: task.answer,
  };
}

function buildReadingChallenge(
  target: ChallengeTarget,
  userId: string,
): ChallengePayload {
  const matching = READING_MICRO.filter((item) => item.concept === target.concept);
  const pool = matching.length > 0 ? matching : READING_MICRO;
  const item = pool[pickDailyIndex(userId, `reading-${target.concept}`, pool.length)] ?? pool[0];

  return {
    type: 'reading',
    concept: target.concept,
    difficulty: target.difficulty,
    question: `${item.passage}\n\n${item.question}`,
    options: item.options,
    answer: item.answer,
  };
}

function buildSpeakingChallenge(
  target: ChallengeTarget,
  userId: string,
): ChallengePayload {
  const matching = SPEAKING_PROMPTS.filter((item) => item.concept === target.concept);
  const pool = matching.length > 0 ? matching : SPEAKING_PROMPTS;
  const item = pool[pickDailyIndex(userId, `speaking-${target.concept}`, pool.length)] ?? pool[0];

  return {
    type: 'speaking',
    concept: target.concept,
    difficulty: target.difficulty,
    question: 'Speaking challenge',
    prompt: item.prompt,
    answer: item.answer,
  };
}

function buildWritingChallenge(
  target: ChallengeTarget,
  userId: string,
): ChallengePayload {
  const matching = WRITING_TASKS.filter((item) => item.concept === target.concept);
  const pool = matching.length > 0 ? matching : WRITING_TASKS;
  const item = pool[pickDailyIndex(userId, `writing-${target.concept}`, pool.length)] ?? pool[0];

  return {
    type: 'writing',
    concept: target.concept,
    difficulty: target.difficulty,
    question: 'Writing challenge',
    prompt: item.prompt,
    answer: item.answer,
  };
}

function pickConceptForModule(module: ChallengeModule, userId: string): string {
  const concepts: Record<ChallengeModule, string[]> = {
    grammar: ['articles', 'tenses', 'prepositions', 'modals'],
    vocabulary: ['synonyms', 'antonyms', 'collocations'],
    reading: ['inference', 'detail', 'vocabulary_in_context'],
    speaking: ['fluency_patterns', 'pronunciation_patterns'],
    writing: ['coherence', 'structure', 'grammar_patterns'],
  };

  const pool = concepts[module] ?? concepts.grammar;
  return pool[pickDailyIndex(userId, `concept-${module}`, pool.length)] ?? pool[0];
}

function normalizeModule(module: string): ChallengeModule {
  const allowed: ChallengeModule[] = [
    'grammar',
    'vocabulary',
    'reading',
    'speaking',
    'writing',
  ];
  return allowed.includes(module as ChallengeModule)
    ? (module as ChallengeModule)
    : 'grammar';
}

function clampDifficulty(level: number): number {
  if (!Number.isFinite(level)) return 2;
  return Math.min(5, Math.max(1, Math.round(level)));
}

function levelBaseDifficulty(level: LearnerLevel): number {
  switch (level) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
    default:
      return 3;
  }
}

export function gradeChallengeAnswer(
  challenge: ChallengePayload,
  userAnswer: string,
): { correct: boolean; score: number } {
  const answer = userAnswer.trim();
  if (!answer) {
    return { correct: false, score: 0 };
  }

  if (challenge.type === 'speaking' || challenge.type === 'writing') {
    return gradeOpenAnswer(challenge.answer, answer);
  }

  if (!challenge.answer) {
    return { correct: true, score: 70 };
  }

  const normalizedUser = answer.toLowerCase();
  const normalizedCorrect = challenge.answer.toLowerCase();
  const correct = normalizedUser === normalizedCorrect;
  return { correct, score: correct ? 100 : 0 };
}

function gradeOpenAnswer(
  expected: string | undefined,
  userAnswer: string,
): { correct: boolean; score: number } {
  const lower = userAnswer.toLowerCase();
  if (expected) {
    const keywords = expected.toLowerCase().split('|').map((item) => item.trim());
    const matched = keywords.some((keyword) => keyword && lower.includes(keyword));
    if (matched) {
      return { correct: true, score: 100 };
    }
  }

  const sufficient = userAnswer.trim().length >= 12;
  return { correct: sufficient, score: sufficient ? 75 : 25 };
}
