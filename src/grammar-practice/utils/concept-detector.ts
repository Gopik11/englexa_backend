import { GrammarTopic } from '../interfaces/grammar-exercise.interface';

const TOPIC_DEFAULT_CONCEPT: Record<GrammarTopic, string> = {
  articles: 'Articles',
  simple_present: 'Simple Present',
  simple_past: 'Past Tense',
  prepositions: 'Prepositions',
  subject_verb: 'Subject-Verb Agreement',
  basic_structure: 'Sentence Structure',
  present_vs_continuous: 'Present vs Continuous',
  past_vs_continuous: 'Past vs Continuous',
  countable_uncountable: 'Countable / Uncountable',
  comparatives: 'Comparatives',
  modals: 'Modals',
  adverbs: 'Adverbs',
  conditionals: 'Conditionals',
  relative_clauses: 'Relative Clauses',
  passive_voice: 'Passive Voice',
  reported_speech: 'Reported Speech',
  perfect_tenses: 'Perfect Tenses',
  connectors: 'Connectors',
};

const ARTICLE_PATTERN = /\b(a|an|the)\b/i;
const PREPOSITIONS = [
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'by',
  'from',
  'of',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'over',
];

/**
 * Identifies the grammar concept behind a learner mistake.
 *
 * Heuristics cover articles, subject-verb agreement, simple present,
 * prepositions, and past tense; other topics fall back to a topic label.
 */
export function identifyConcept(
  topic: string,
  userAnswer: string,
  correctAnswer: string,
): string {
  const defaultConcept = getDefaultConcept(topic);
  const user = userAnswer.trim();
  const correct = correctAnswer.trim();

  if (!user || !correct) {
    return defaultConcept;
  }

  switch (topic) {
    case 'articles':
      return detectArticles(user, correct) ?? defaultConcept;
    case 'subject_verb':
      return detectSubjectVerbAgreement(user, correct) ?? defaultConcept;
    case 'simple_present':
      return detectSimplePresent(user, correct) ?? defaultConcept;
    case 'prepositions':
      return detectPrepositions(user, correct) ?? defaultConcept;
    case 'simple_past':
      return detectPastTense(user, correct) ?? defaultConcept;
    default:
      return detectExtendedTense(topic, user, correct) ?? defaultConcept;
  }
}

/** Concepts associated with a grammar topic (for adaptive tracking). */
export function conceptsForTopic(topic: GrammarTopic): string[] {
  const primary = TOPIC_DEFAULT_CONCEPT[topic];
  return primary ? [primary] : [formatTopicLabel(topic)];
}

function getDefaultConcept(topic: string): string {
  const known = TOPIC_DEFAULT_CONCEPT[topic as GrammarTopic];
  return known ?? formatTopicLabel(topic);
}

function formatTopicLabel(topic: string): string {
  return topic
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Articles — missing or incorrect a/an/the. */
function detectArticles(user: string, correct: string): string | null {
  const correctArticle = correct.match(ARTICLE_PATTERN)?.[1]?.toLowerCase();
  const userArticle = user.match(ARTICLE_PATTERN)?.[1]?.toLowerCase();

  if (correctArticle && !userArticle) {
    return 'Articles';
  }

  if (correctArticle && userArticle && correctArticle !== userArticle) {
    return 'Articles';
  }

  if (/\b(a)\s+[aeiou]/i.test(user) && /\ban\b/i.test(correct)) {
    return 'Articles';
  }

  if (/\ban\b/i.test(user) && /\ba\b/i.test(correct)) {
    return 'Articles';
  }

  const correctHasArticle = ARTICLE_PATTERN.test(correct);
  const userHasArticle = ARTICLE_PATTERN.test(user);
  if (correctHasArticle && !userHasArticle) {
    return 'Articles';
  }

  return null;
}

/** Subject-verb agreement — plural/singular mismatch or wrong verb ending. */
function detectSubjectVerbAgreement(user: string, correct: string): string | null {
  const pluralMarkers = ['they', 'we', 'people', 'children'];
  const userLower = user.toLowerCase();
  const correctLower = correct.toLowerCase();

  const userPlural = pluralMarkers.some((m) => userLower.includes(m));
  const correctPlural = pluralMarkers.some((m) => correctLower.includes(m));

  if (userPlural !== correctPlural) {
    return 'Subject-Verb Agreement';
  }

  const userVerb = findLikelyVerb(tokenize(user));
  const correctVerb = findLikelyVerb(tokenize(correct));

  if (userVerb && correctVerb && userVerb !== correctVerb) {
    const sMismatch =
      userVerb.endsWith('s') !== correctVerb.endsWith('s');
    const baseMismatch =
      stripVerbEnding(userVerb) !== stripVerbEnding(correctVerb);

    if (sMismatch || baseMismatch) {
      return 'Subject-Verb Agreement';
    }
  }

  return 'Subject-Verb Agreement';
}

/** Simple present — wrong verb form (e.g. missing -s, wrong base). */
function detectSimplePresent(user: string, correct: string): string | null {
  const userVerb = findLikelyVerb(tokenize(user));
  const correctVerb = findLikelyVerb(tokenize(correct));

  if (!userVerb || !correctVerb) {
    return 'Simple Present';
  }

  if (userVerb !== correctVerb) {
    return 'Simple Present';
  }

  return null;
}

/** Prepositions — incorrect or missing preposition. */
function detectPrepositions(user: string, correct: string): string | null {
  const userPrep = findPreposition(user);
  const correctPrep = findPreposition(correct);

  if (correctPrep && userPrep !== correctPrep) {
    return 'Prepositions';
  }

  return 'Prepositions';
}

/** Past tense — wrong past verb form (e.g. walk vs walked). */
function detectPastTense(user: string, correct: string): string | null {
  const userVerb = findLikelyVerb(tokenize(user));
  const correctVerb = findLikelyVerb(tokenize(correct));

  if (!userVerb || !correctVerb) {
    return 'Past Tense';
  }

  if (userVerb !== correctVerb) {
    const userLooksPresent = !userVerb.endsWith('ed') && userVerb === stripVerbEnding(userVerb);
    const correctLooksPast = correctVerb.endsWith('ed') || isIrregularPast(userVerb, correctVerb);

    if (userLooksPresent && correctLooksPast) {
      return 'Past Tense';
    }

    return 'Past Tense';
  }

  return null;
}

function detectExtendedTense(
  topic: string,
  user: string,
  correct: string,
): string | null {
  const userVerb = findLikelyVerb(tokenize(user));
  const correctVerb = findLikelyVerb(tokenize(correct));

  if (userVerb && correctVerb && userVerb !== correctVerb) {
    if (topic === 'present_vs_continuous') return 'Present vs Continuous';
    if (topic === 'past_vs_continuous') return 'Past vs Continuous';
    if (topic === 'perfect_tenses') return 'Perfect Tenses';
  }

  return null;
}

function isIrregularPast(userVerb: string, correctVerb: string): boolean {
  return userVerb !== correctVerb && !correctVerb.endsWith('ed');
}

function findPreposition(text: string): string | null {
  const lower = text.toLowerCase();
  for (const prep of PREPOSITIONS) {
    if (new RegExp(`\\b${prep}\\b`, 'i').test(lower)) {
      return prep;
    }
  }
  return null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function findLikelyVerb(tokens: string[]): string | null {
  const skip = new Set([
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'the',
    'a',
    'an',
    'is',
    'are',
    'am',
    'was',
    'were',
    'has',
    'have',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'can',
    'could',
    'should',
    'must',
  ]);

  for (const token of tokens) {
    if (!skip.has(token) && token.length > 1) {
      return token;
    }
  }

  return tokens.at(-1) ?? null;
}

function stripVerbEnding(verb: string): string {
  if (verb.endsWith('ies')) return verb.slice(0, -3) + 'y';
  if (verb.endsWith('es')) return verb.slice(0, -2);
  if (verb.endsWith('ed')) return verb.slice(0, -2);
  if (verb.endsWith('ing')) return verb.slice(0, -3);
  if (verb.endsWith('s')) return verb.slice(0, -1);
  return verb;
}
