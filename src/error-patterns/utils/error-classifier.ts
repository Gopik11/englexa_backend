import {
  DetectedErrorPattern,
  DetectErrorInput,
  ErrorPatternModule,
} from '../entities/error-pattern.entity';

const ARTICLE_PATTERN = /\b(a|an|the)\b/i;
const MODALS = [
  'can',
  'could',
  'may',
  'might',
  'must',
  'shall',
  'should',
  'will',
  'would',
];
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

const PAST_MARKERS = /\b(yesterday|last\s+\w+|ago)\b/i;
const PLURAL_MARKERS = ['they', 'we', 'people', 'children', 'these', 'those'];

export function classifyError(input: DetectErrorInput): DetectedErrorPattern {
  const user = input.userAnswer.trim();
  const correct = input.correctAnswer.trim();
  const concept =
    input.concept?.trim() ||
    input.topic?.replace(/_/g, ' ') ||
    defaultConcept(input.module);

  switch (input.module) {
    case 'grammar':
      return classifyGrammarError(user, correct, concept, input.topic);
    case 'vocabulary':
      return classifyVocabularyError(user, correct, concept, input.topic);
    case 'reading':
      return classifyReadingError(user, correct, concept);
    case 'speaking':
      return classifySpeakingError(user, correct, concept);
    case 'writing':
      return classifyWritingError(user, correct, concept);
    default:
      return {
        module: input.module,
        concept,
        error_type: 'wrong_word_choice',
      };
  }
}

function classifyGrammarError(
  user: string,
  correct: string,
  concept: string,
  topic?: string,
): DetectedErrorPattern {
  const module: ErrorPatternModule = 'grammar';

  if (topic === 'modals' || hasModal(correct)) {
    const userModal = findModal(user);
    const correctModal = findModal(correct);
    if (correctModal && userModal !== correctModal) {
      return { module, concept: concept || 'modals', error_type: 'modal_misuse' };
    }
  }

  const correctArticle = correct.match(ARTICLE_PATTERN)?.[1]?.toLowerCase();
  const userArticle = user.match(ARTICLE_PATTERN)?.[1]?.toLowerCase();
  if (correctArticle && !userArticle) {
    return { module, concept: concept || 'articles', error_type: 'missing_article' };
  }
  if (correctArticle && userArticle && correctArticle !== userArticle) {
    return { module, concept: concept || 'articles', error_type: 'wrong_article' };
  }
  if (/\b(a)\s+[aeiou]/i.test(user) && /\ban\b/i.test(correct)) {
    return { module, concept: concept || 'articles', error_type: 'wrong_article' };
  }
  if (/\ban\b/i.test(user) && /\ba\b/i.test(correct)) {
    return { module, concept: concept || 'articles', error_type: 'wrong_article' };
  }

  const userPrep = findPreposition(user);
  const correctPrep = findPreposition(correct);
  if (correctPrep && userPrep !== correctPrep) {
    return {
      module,
      concept: concept || 'prepositions',
      error_type: 'wrong_preposition',
    };
  }

  if (isSubjectVerbMismatch(user, correct)) {
    return {
      module,
      concept: concept || 'subject_verb_agreement',
      error_type: 'subject_verb_agreement',
    };
  }

  if (isPluralizationError(user, correct)) {
    return {
      module,
      concept: concept || 'pluralization',
      error_type: 'pluralization_error',
    };
  }

  if (isWordOrderError(user, correct)) {
    return { module, concept, error_type: 'word_order' };
  }

  if (isTenseError(user, correct, topic)) {
    return {
      module,
      concept: concept || tenseConcept(topic),
      error_type: 'tense_error',
    };
  }

  return { module, concept, error_type: 'tense_error' };
}

function classifyVocabularyError(
  user: string,
  correct: string,
  concept: string,
  topic?: string,
): DetectedErrorPattern {
  const module: ErrorPatternModule = 'vocabulary';
  const userTokens = tokenize(user);
  const correctTokens = tokenize(correct);

  if (looksLikeAntonym(user, correct)) {
    return {
      module,
      concept: concept || topic || 'vocabulary',
      error_type: 'antonym_confusion',
    };
  }

  if (tokenOverlap(userTokens, correctTokens) > 0.4) {
    return {
      module,
      concept: concept || topic || 'vocabulary',
      error_type: 'synonym_confusion',
    };
  }

  return {
    module,
    concept: concept || topic || 'vocabulary',
    error_type: 'wrong_word_choice',
  };
}

function classifyReadingError(
  user: string,
  correct: string,
  concept: string,
): DetectedErrorPattern {
  return classifyVocabularyError(user, correct, concept);
}

function classifySpeakingError(
  user: string,
  _correct: string,
  concept: string,
): DetectedErrorPattern {
  const module: ErrorPatternModule = 'speaking';
  const wordCount = tokenize(user).length;

  if (wordCount < 4 || /\b(um|uh|er)\b/i.test(user)) {
    return { module, concept, error_type: 'fluency_pattern' };
  }

  return { module, concept, error_type: 'pronunciation_pattern' };
}

function classifyWritingError(
  user: string,
  correct: string,
  concept: string,
): DetectedErrorPattern {
  const module: ErrorPatternModule = 'writing';

  if (hasPunctuationIssue(user, correct)) {
    return { module, concept, error_type: 'punctuation_error' };
  }

  return { module, concept, error_type: 'coherence_issue' };
}

function defaultConcept(module: ErrorPatternModule): string {
  switch (module) {
    case 'grammar':
      return 'grammar';
    case 'vocabulary':
      return 'vocabulary';
    case 'reading':
      return 'reading';
    case 'speaking':
      return 'speaking';
    case 'writing':
      return 'writing';
    default:
      return module;
  }
}

function tenseConcept(topic?: string): string {
  if (!topic) return 'tenses';
  if (topic.includes('past')) return 'past_tense';
  if (topic.includes('present')) return 'present_tense';
  if (topic.includes('perfect')) return 'perfect_tenses';
  return topic;
}

function hasModal(text: string): boolean {
  return MODALS.some((modal) => new RegExp(`\\b${modal}\\b`, 'i').test(text));
}

function findModal(text: string): string | null {
  const lower = text.toLowerCase();
  return MODALS.find((modal) => new RegExp(`\\b${modal}\\b`, 'i').test(lower)) ?? null;
}

function findPreposition(text: string): string | null {
  const lower = text.toLowerCase();
  return (
    PREPOSITIONS.find((prep) => new RegExp(`\\b${prep}\\b`, 'i').test(lower)) ??
    null
  );
}

function isSubjectVerbMismatch(user: string, correct: string): boolean {
  const userLower = user.toLowerCase();
  const correctLower = correct.toLowerCase();
  const userPlural = PLURAL_MARKERS.some((m) => userLower.includes(m));
  const correctPlural = PLURAL_MARKERS.some((m) => correctLower.includes(m));
  if (userPlural !== correctPlural) return true;

  const userVerb = findLikelyVerb(tokenize(user));
  const correctVerb = findLikelyVerb(tokenize(correct));
  if (!userVerb || !correctVerb) return false;

  return (
    userVerb.endsWith('s') !== correctVerb.endsWith('s') ||
    stripVerbEnding(userVerb) !== stripVerbEnding(correctVerb)
  );
}

function isPluralizationError(user: string, correct: string): boolean {
  const userTokens = tokenize(user);
  const correctTokens = tokenize(correct);
  return userTokens.some((token, index) => {
    const match = correctTokens[index];
    if (!match) return false;
    return (
      (token.endsWith('s') !== match.endsWith('s') &&
        stripPlural(token) === stripPlural(match)) ||
      (token.endsWith('ies') && match.endsWith('y'))
    );
  });
}

function isWordOrderError(user: string, correct: string): boolean {
  const userTokens = tokenize(user);
  const correctTokens = tokenize(correct);
  if (userTokens.length !== correctTokens.length) return false;
  const sameMultiset =
    [...userTokens].sort().join(' ') === [...correctTokens].sort().join(' ');
  return sameMultiset && userTokens.join(' ') !== correctTokens.join(' ');
}

function isTenseError(user: string, correct: string, topic?: string): boolean {
  if (topic?.includes('tense') || topic?.includes('past') || topic?.includes('present')) {
    const userVerb = findLikelyVerb(tokenize(user));
    const correctVerb = findLikelyVerb(tokenize(correct));
    if (userVerb && correctVerb && userVerb !== correctVerb) return true;
  }

  if (PAST_MARKERS.test(correct) || PAST_MARKERS.test(user)) {
    const userVerb = findLikelyVerb(tokenize(user));
    const correctVerb = findLikelyVerb(tokenize(correct));
    if (userVerb && correctVerb) {
      const userPast = userVerb.endsWith('ed') || isIrregularPast(userVerb, correctVerb);
      const correctPast =
        correctVerb.endsWith('ed') || isIrregularPast(correctVerb, userVerb);
      return userPast !== correctPast;
    }
  }

  return findLikelyVerb(tokenize(user)) !== findLikelyVerb(tokenize(correct));
}

function hasPunctuationIssue(user: string, correct: string): boolean {
  const userPunct = (user.match(/[.,!?;:]/g) ?? []).join('');
  const correctPunct = (correct.match(/[.,!?;:]/g) ?? []).join('');
  return userPunct !== correctPunct;
}

function looksLikeAntonym(user: string, correct: string): boolean {
  const pairs: [string, string][] = [
    ['hot', 'cold'],
    ['big', 'small'],
    ['happy', 'sad'],
    ['increase', 'decrease'],
    ['accept', 'reject'],
    ['begin', 'end'],
    ['love', 'hate'],
  ];
  const userLower = user.toLowerCase();
  const correctLower = correct.toLowerCase();
  return pairs.some(
    ([a, b]) =>
      (userLower.includes(a) && correctLower.includes(b)) ||
      (userLower.includes(b) && correctLower.includes(a)),
  );
}

function tokenOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((token) => setB.has(token)).length;
  return shared / Math.max(a.length, b.length);
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
  ]);
  for (const token of tokens) {
    if (!skip.has(token) && token.length > 1) return token;
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

function stripPlural(token: string): string {
  if (token.endsWith('ies')) return token.slice(0, -3) + 'y';
  if (token.endsWith('es')) return token.slice(0, -2);
  if (token.endsWith('s')) return token.slice(0, -1);
  return token;
}

function isIrregularPast(a: string, b: string): boolean {
  return a !== b && !a.endsWith('ed') && !b.endsWith('ed');
}
