import {
  GRAMMAR_RULE_EXPLANATIONS,
  GrammarRuleKey,
  MICRO_LESSONS,
} from '../../content/englexa-content-spec.constants';

export interface MicroLesson {
  title: string;
  explanation: string;
  examples: string[];
  practice: string[];
}

interface ConceptLessonSeed {
  title: string;
  primaryRuleKey: GrammarRuleKey;
  /** Second example sentence — spec-aligned, simple English. */
  secondExample: string;
  /** Optional middle sentence to reach 2–3 sentences total. */
  supportingSentence?: string;
  practice: [string] | [string, string];
}

/**
 * Micro-lessons follow englexa_content_spec.md:
 * friendly tone, simple English, concise explanations (2–3 sentences),
 * two examples, and one or two short practice tasks.
 */
const CONCEPT_LESSON_SEEDS: Record<string, ConceptLessonSeed> = {
  Articles: {
    title: "Using 'a', 'an', and 'the'",
    primaryRuleKey: 'article',
    supportingSentence:
      'Use "the" when the listener already knows which noun you mean.',
    secondExample: 'She ate an apple for lunch.',
    practice: ['Rewrite: I have cat.', 'Choose: I bought (a/the) phone.'],
  },
  'Subject-Verb Agreement': {
    title: 'Matching subjects and verbs',
    primaryRuleKey: 'simple_present',
    supportingSentence:
      'Plural subjects take plural verbs, and singular subjects take singular verbs.',
    secondExample: 'They walk to work every day.',
    practice: ['Fix: He play soccer.', 'Fix: The dogs runs fast.'],
  },
  'Simple Present': {
    title: 'Simple present tense',
    primaryRuleKey: 'simple_present',
    supportingSentence:
      'Use the simple present for habits, routines, and general facts.',
    secondExample: 'Water boils at 100°C.',
    practice: ['Fill in: He ___ (read) every night.', 'Fix: They goes to school.'],
  },
  'Past Tense': {
    title: 'Simple past tense',
    primaryRuleKey: 'verb_tense',
    supportingSentence:
      'Irregular verbs have special past forms, so check the verb carefully.',
    secondExample: 'She went home early.',
    practice: ['Fill in: We ___ (visit) London last year.', 'Fix: He go to bed late.'],
  },
  Prepositions: {
    title: 'Choosing prepositions',
    primaryRuleKey: 'preposition',
    supportingSentence:
      'The right preposition depends on whether you are talking about time, place, or direction.',
    secondExample: 'She lives in London.',
    practice: ['Choose: The book is (in/on) the table.', 'Fix: I was born at May.'],
  },
  'Present vs Continuous': {
    title: 'Present simple vs continuous',
    primaryRuleKey: 'present_continuous',
    supportingSentence:
      'Use the present simple for habits and the present continuous for actions happening now.',
    secondExample: 'She is drinking coffee right now.',
    practice: [
      'Choose: Look! It (rains / is raining).',
      'Fix: I am knowing the answer.',
    ],
  },
  'Past vs Continuous': {
    title: 'Past simple vs continuous',
    primaryRuleKey: 'past_continuous',
    supportingSentence:
      'Use past simple for a finished action that interrupts a longer background action.',
    secondExample: 'They were studying all evening.',
    practice: ['Fix: I was walk when it started to rain.'],
  },
  'Countable / Uncountable': {
    title: 'Countable and uncountable nouns',
    primaryRuleKey: 'countable',
    supportingSentence:
      'Some nouns need a unit phrase, such as a bottle of water or a piece of advice.',
    secondExample: 'How much sugar do you want?',
    practice: ['Choose: How (many/much) bread do we have?'],
  },
  Comparatives: {
    title: 'Comparatives and superlatives',
    primaryRuleKey: 'comparative',
    supportingSentence: 'Use than when you compare two things.',
    secondExample: 'This is the fastest route.',
    practice: ['Complete: This box is (heavy) ___ that one.'],
  },
  Modals: {
    title: 'Modal verbs',
    primaryRuleKey: 'modal',
    supportingSentence:
      'Modals like can, should, and must express ability, advice, or obligation.',
    secondExample: 'She can swim well.',
    practice: ['Fix: He must to leave now.'],
  },
  Adverbs: {
    title: 'Using adverbs',
    primaryRuleKey: 'adverb',
    supportingSentence:
      'Place the adverb near the verb it describes so the sentence sounds natural.',
    secondExample: 'He drives carefully.',
    practice: ['Rewrite with an adverb: She spoke slow.'],
  },
  Conditionals: {
    title: 'First conditional',
    primaryRuleKey: 'conditional',
    supportingSentence:
      'This pattern is useful for real future possibilities and likely results.',
    secondExample: 'If you study, you will pass.',
    practice: ['Complete: If she (calls), I (answer).'],
  },
  'Relative Clauses': {
    title: 'Relative clauses',
    primaryRuleKey: 'relative_clause',
    supportingSentence:
      'Relative clauses add useful detail without starting a new sentence.',
    secondExample: 'The book that I bought is great.',
    practice: ['Join: I met a man. He teaches English.'],
  },
  'Passive Voice': {
    title: 'Passive voice',
    primaryRuleKey: 'passive',
    supportingSentence:
      'Use passive voice when the action is more important than who did it.',
    secondExample: 'The cake was baked yesterday.',
    practice: ['Rewrite in passive: They built the bridge in 1990.'],
  },
  'Reported Speech': {
    title: 'Reported speech',
    primaryRuleKey: 'reported_speech',
    supportingSentence:
      'Reported speech often moves present tense forms one step into the past.',
    secondExample: 'He told me he had finished.',
    practice: ['Report: "I am busy," she said.'],
  },
  'Perfect Tenses': {
    title: 'Perfect tenses',
    primaryRuleKey: 'perfect_tense',
    supportingSentence:
      'The present perfect connects a past action to the present moment.',
    secondExample: 'She has already left.',
    practice: ['Fix: I have saw that movie.'],
  },
  Connectors: {
    title: 'Sentence connectors',
    primaryRuleKey: 'connector',
    supportingSentence:
      'Connectors like because, although, and however show reason or contrast.',
    secondExample: 'I stayed home because I was tired.',
    practice: ['Join with because: I was late. The bus broke down.'],
  },
  'Sentence Structure': {
    title: 'Basic sentence structure',
    primaryRuleKey: 'missing_subject',
    supportingSentence:
      'A complete English sentence needs both a subject and a verb.',
    secondExample: 'She reads books every evening.',
    practice: ['Fix: Go to the store every day.'],
  },
  'Verb Tense': {
    title: 'Verb tense',
    primaryRuleKey: 'verb_tense',
    supportingSentence:
      'Check whether your sentence describes the past, present, or future.',
    secondExample: 'Yesterday, I walked to school.',
    practice: ['Fix the verb tense in your last sentence.'],
  },
};

export function generateMicroLesson(concept: string): MicroLesson {
  const seed = CONCEPT_LESSON_SEEDS[concept];
  if (seed) {
    return buildLessonFromSeed(seed);
  }

  return buildFallbackLesson(concept);
}

/** Serializes a micro-lesson for API responses (micro_lesson remains string | null). */
export function formatMicroLessonForResponse(lesson: MicroLesson): string {
  const exampleLines = lesson.examples.map((item) => `• ${item}`).join('\n');
  const practiceLines = lesson.practice.map((item) => `• ${item}`).join('\n');

  return [
    lesson.title,
    '',
    lesson.explanation,
    '',
    'Examples:',
    exampleLines,
    '',
    'Practice:',
    practiceLines,
  ].join('\n');
}

function buildLessonFromSeed(seed: ConceptLessonSeed): MicroLesson {
  const primaryRule = resolvePrimaryRuleText(seed.primaryRuleKey);
  const explanation = buildExplanation(primaryRule, seed.supportingSentence);
  const primaryExample = GRAMMAR_RULE_EXPLANATIONS[seed.primaryRuleKey].example;

  return normalizeLesson({
    title: seed.title,
    explanation,
    examples: [primaryExample, seed.secondExample],
    practice: [...seed.practice],
  });
}

function buildFallbackLesson(concept: string): MicroLesson {
  const label = concept.toLowerCase();

  return normalizeLesson({
    title: concept,
    explanation: buildExplanation(
      `Let's review ${label}. Focus on one small change at a time.`,
      'Use the examples below, then try the short practice task.',
    ),
    examples: [
      GRAMMAR_RULE_EXPLANATIONS.article.example,
      GRAMMAR_RULE_EXPLANATIONS.simple_present.example,
    ],
    practice: [`Write one sentence using ${label} correctly.`],
  });
}

function resolvePrimaryRuleText(ruleKey: GrammarRuleKey): string {
  if (ruleKey === 'article') {
    return MICRO_LESSONS.article.text;
  }

  if (ruleKey === 'verb_tense') {
    return MICRO_LESSONS.verb_tense.text;
  }

  if (ruleKey === 'preposition') {
    return MICRO_LESSONS.preposition.text;
  }

  return GRAMMAR_RULE_EXPLANATIONS[ruleKey].rule;
}

function buildExplanation(
  primaryRule: string,
  supportingSentence?: string,
): string {
  const sentences = [ensureSentence(primaryRule)];

  if (supportingSentence) {
    sentences.push(ensureSentence(supportingSentence));
  }

  if (sentences.length < 2) {
    sentences.push('Try using this pattern in a sentence of your own.');
  }

  return sentences.slice(0, 3).join(' ');
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function normalizeLesson(lesson: MicroLesson): MicroLesson {
  return {
    title: lesson.title,
    explanation: lesson.explanation,
    examples: lesson.examples.slice(0, 2),
    practice: lesson.practice.slice(0, 2),
  };
}

function sentenceCount(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

/** @internal Validates spec structure — used in tests. */
export function validateMicroLessonStructure(lesson: MicroLesson): boolean {
  const explanationSentences = sentenceCount(lesson.explanation);

  return (
    lesson.title.trim().length > 0 &&
    explanationSentences >= 2 &&
    explanationSentences <= 3 &&
    lesson.examples.length === 2 &&
    lesson.practice.length >= 1 &&
    lesson.practice.length <= 2
  );
}
