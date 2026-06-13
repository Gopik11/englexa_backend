import { Injectable } from '@nestjs/common';
import {
  GRAMMAR_RULE_EXPLANATIONS,
  GrammarRuleKey,
  LearnerLevel,
  SPEC_SPELLING_EXAMPLES,
  VOCABULARY_SUGGESTIONS,
  VOCABULARY_TEMPLATES,
  buildGrammarExplanation,
  fillTemplate,
} from '../../content/englexa-content-spec.constants';
import { buildWritingEnrichedFeedback } from '../../content/feedback-enrichment';
import { TutorFeedbackService } from '../../ai/tutor-feedback.service';
import {
  SubmitWritingResult,
  WritingMicroLesson,
  WritingPrompt,
  WritingTopic,
} from '../interfaces/writing-prompt.interface';

export interface EvaluateWritingContext {
  userId?: string;
  prompt?: WritingPrompt | null;
}

export interface EvaluateWritingInput {
  userId: string;
  level: LearnerLevel;
  topic: WritingTopic;
  text: string;
  prompt?: WritingPrompt | null;
}

type WeaknessArea = 'grammar' | 'vocabulary' | 'coherence' | 'structure';

interface GrammarIssue {
  ruleKey: GrammarRuleKey;
  message: string;
  sentenceIndex: number;
}

interface DimensionScores {
  grammar: number;
  vocabulary: number;
  coherence: number;
  structure: number;
}

const WRITING_MICRO_LESSON_THRESHOLD = 2;

const COHERENCE_MARKERS = [
  'however',
  'therefore',
  'because',
  'although',
  'for example',
  'in addition',
  'first',
  'finally',
  'also',
  'then',
  'moreover',
  'as a result',
];

const STRUCTURE_MARKERS = {
  intro: [
    'in my opinion',
    'i think',
    'i believe',
    'this essay',
    'the purpose',
    'dear ',
    'hello ',
  ],
  conclusion: [
    'in conclusion',
    'to sum up',
    'overall',
    'in summary',
    'best regards',
    'thank you',
  ],
};

const BASIC_WORDS = new Set([
  'good',
  'nice',
  'want',
  'thing',
  'very',
  'bad',
  'big',
  'small',
  'like',
  'get',
]);

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'my',
  'your',
  'is',
  'am',
  'are',
  'was',
  'were',
  'to',
  'in',
  'on',
  'at',
  'for',
  'of',
  'with',
  'this',
  'that',
]);

const MICRO_LESSON_CONTENT: Record<
  WeaknessArea,
  { tip: string; example: string }
> = {
  grammar: {
    tip: 'Check one sentence at a time: subject + verb + correct tense and articles.',
    example:
      'Yesterday, I visited a museum. The guide explained the history clearly.',
  },
  vocabulary: {
    tip: 'Replace repeated basic words with more precise alternatives.',
    example:
      'The presentation was excellent because the speaker used clear, specific examples.',
  },
  coherence: {
    tip: 'Link ideas with words such as "because", "however", and "for example".',
    example:
      'I enjoy city life because there are many opportunities. For example, I can join language clubs.',
  },
  structure: {
    tip: 'Use a topic sentence, supporting sentences, and a short closing line.',
    example:
      'In my opinion, daily reading improves writing. It builds vocabulary and confidence. In conclusion, short practice sessions work best.',
  },
};

/**
 * Evaluates learner writing for grammar, vocabulary, coherence, and structure.
 * Tone: friendly, clear, supportive (englexa_content_spec.md §2).
 */
export function evaluateWriting(
  level: LearnerLevel,
  topic: WritingTopic,
  text: string,
  context: EvaluateWritingContext = {},
  tutorFeedback?: TutorFeedbackService,
): SubmitWritingResult {
  const trimmed = text.trim();
  const sentences = splitSentences(trimmed);
  const paragraphs = splitParagraphs(trimmed);

  const grammarIssues = detectGrammarIssues(sentences);
  const correctedText = buildCorrectedText(
    sentences,
    grammarIssues,
    tutorFeedback,
    context.userId,
    level,
  );

  const vocabularyAnalysis = analyzeVocabulary(trimmed, level);
  const coherenceAnalysis = analyzeCoherence(trimmed, sentences, level);
  const structureAnalysis = analyzeStructure(
    trimmed,
    paragraphs,
    sentences,
    level,
    topic,
    context.prompt,
  );

  const scores: DimensionScores = {
    grammar: scoreGrammar(grammarIssues, correctedText, trimmed),
    vocabulary: vocabularyAnalysis.score,
    coherence: coherenceAnalysis.score,
    structure: structureAnalysis.score,
  };

  const grammarFeedback = buildGrammarFeedback(grammarIssues, trimmed, correctedText);
  const vocabularyFeedback = buildVocabularyFeedback(vocabularyAnalysis, level);
  const coherenceFeedback = coherenceAnalysis.feedback;
  const structureFeedback = structureAnalysis.feedback;

  const overallScore = Math.round(
    (scores.grammar + scores.vocabulary + scores.coherence + scores.structure) / 4,
  );

  const encouragement =
    overallScore >= 75
      ? ''
      : 'Good effort. Focus on the main feedback area below and revise one paragraph at a time.';

  const mainWeakness = pickMainWeakness(scores);
  const microLesson = maybeBuildMicroLesson(
    context.userId ?? 'learner',
    topic,
    overallScore,
    mainWeakness,
    context.prompt,
  );

  const enriched = buildWritingEnrichedFeedback({
    userId: context.userId ?? 'learner',
    level,
    isCorrect: overallScore >= 78,
    conceptKey: mainWeakness,
    grammarFeedback,
    vocabularyFeedback,
    coherenceFeedback,
    structureFeedback,
    correctedSentence: correctedText,
    microLesson,
  });

  return {
    correctedText,
    grammarFeedback,
    vocabularyFeedback,
    coherenceFeedback,
    structureFeedback,
    microLesson,
    ...enriched,
  };
}

export function detectGrammarIssues(sentences: string[]): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  sentences.forEach((sentence, index) => {
    issues.push(...detectSentenceGrammarIssues(sentence, index));
  });

  return dedupeGrammarIssues(issues);
}

function detectSentenceGrammarIssues(
  sentence: string,
  sentenceIndex: number,
): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const trimmed = sentence.trim();
  if (!trimmed) {
    return issues;
  }

  if (!/^[A-Z]/.test(trimmed)) {
    issues.push({
      ruleKey: 'missing_subject',
      message: buildGrammarExplanation('missing_subject'),
      sentenceIndex,
    });
  }

  if (!/[.!?]$/.test(trimmed)) {
    issues.push({
      ruleKey: 'connector',
      message:
        'Finish each sentence with clear punctuation (. ! ?) so your ideas sound complete.',
      sentenceIndex,
    });
  }

  if (/\ban\s+([b-df-hj-np-tv-z])/i.test(trimmed)) {
    issues.push({
      ruleKey: 'article',
      message: buildGrammarExplanation('article'),
      sentenceIndex,
    });
  }

  if (/\ba\s+([aeiou])/i.test(trimmed)) {
    issues.push({
      ruleKey: 'article',
      message: buildGrammarExplanation('article'),
      sentenceIndex,
    });
  }

  if (
    /\b(yesterday|last week|last year|ago)\b/i.test(trimmed) &&
    /\b(I|you|we|they|he|she)\s+(walk|play|work|study|go|visit|watch)\b/i.test(
      trimmed,
    )
  ) {
    issues.push({
      ruleKey: 'verb_tense',
      message: buildGrammarExplanation('verb_tense'),
      sentenceIndex,
    });
  }

  if (/\bat\s+monday\b/i.test(trimmed) || /\bon\s+\d{4}\b/.test(trimmed)) {
    issues.push({
      ruleKey: 'preposition',
      message: buildGrammarExplanation('preposition'),
      sentenceIndex,
    });
  }

  if (/^(go|walk|run|play|study|work|visit)\b/i.test(trimmed)) {
    issues.push({
      ruleKey: 'missing_subject',
      message: buildGrammarExplanation('missing_subject'),
      sentenceIndex,
    });
  }

  if (/\b(he|she|it)\s+(go|walk|play|work|study|visit|watch)\b/i.test(trimmed)) {
    issues.push({
      ruleKey: 'simple_present',
      message: buildGrammarExplanation('simple_present'),
      sentenceIndex,
    });
  }

  for (const word of tokenize(trimmed)) {
    const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
    if (SPEC_SPELLING_EXAMPLES[normalized]) {
      issues.push({
        ruleKey: 'verb_tense',
        message: `Check spelling: "${word}" → "${SPEC_SPELLING_EXAMPLES[normalized].correct}". ${SPEC_SPELLING_EXAMPLES[normalized].ruleExplanation}`,
        sentenceIndex,
      });
    }
  }

  return issues;
}

function analyzeVocabulary(
  text: string,
  level: LearnerLevel,
): {
  score: number;
  uniqueRatio: number;
  repeatedWords: string[];
  basicWordCount: number;
  suggestions: string[];
} {
  const words = tokenize(text).map((word) => word.toLowerCase());
  const contentWords = words.filter((word) => !STOP_WORDS.has(word));
  const unique = new Set(contentWords);
  const uniqueRatio =
    contentWords.length === 0 ? 0 : unique.size / contentWords.length;

  const frequency = new Map<string, number>();
  for (const word of contentWords) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  const repeatedWords = [...frequency.entries()]
    .filter(([, count]) => count >= 3)
    .map(([word]) => word);

  const basicWordCount = contentWords.filter((word) => BASIC_WORDS.has(word)).length;

  const suggestions: string[] = [];
  for (const entry of VOCABULARY_SUGGESTIONS) {
    if (entry.pattern.test(text)) {
      if (entry.strongerWord) {
        suggestions.push(
          fillTemplate(VOCABULARY_TEMPLATES.strongerVocabulary, {
            stronger_word: entry.strongerWord,
            example_sentence: entry.exampleSentence,
          }),
        );
      } else if (entry.alternativeWord) {
        suggestions.push(
          fillTemplate(VOCABULARY_TEMPLATES.alternativeWord, {
            alternative_word: entry.alternativeWord,
            example_sentence: entry.exampleSentence,
          }),
        );
      }
    }
  }

  let score = 55;
  score += Math.round(uniqueRatio * 30);

  const minUniqueRatio = level === 'beginner' ? 0.55 : level === 'intermediate' ? 0.62 : 0.68;
  if (uniqueRatio >= minUniqueRatio) {
    score += 10;
  }

  score -= repeatedWords.length * 8;
  score -= Math.max(0, basicWordCount - 2) * 4;
  if (suggestions.length === 0 && uniqueRatio >= minUniqueRatio) {
    score += 8;
  }

  return {
    score: clamp(score, 35, 100),
    uniqueRatio,
    repeatedWords,
    basicWordCount,
    suggestions,
  };
}

function analyzeCoherence(
  text: string,
  sentences: string[],
  level: LearnerLevel,
): { score: number; feedback: string } {
  const lower = text.toLowerCase();
  const markersFound = COHERENCE_MARKERS.filter((marker) => lower.includes(marker));
  const flowScore = measureSentenceFlow(sentences);

  let score = 45;
  score += markersFound.length * 10;
  score += Math.round(flowScore * 25);

  const minMarkers = level === 'beginner' ? 1 : 2;
  let feedback: string;

  if (markersFound.length >= minMarkers && flowScore >= 0.35) {
    feedback = `Your ideas flow logically. Helpful links include "${markersFound.slice(0, 2).join('" and "')}".`;
  } else if (markersFound.length === 1) {
    feedback = `You used "${markersFound[0]}". Add another linker such as "because" or "for example" to show how ideas connect.`;
  } else if (flowScore < 0.2 && sentences.length > 1) {
    feedback =
      'Each sentence should connect to the previous one. Repeat a key word or use "because", "so", or "however".';
  } else {
    feedback = buildGrammarExplanation('connector');
  }

  return { score: clamp(score, 35, 100), feedback };
}

function analyzeStructure(
  text: string,
  paragraphs: string[],
  sentences: string[],
  level: LearnerLevel,
  topic: WritingTopic,
  prompt?: WritingPrompt | null,
): { score: number; feedback: string } {
  const wordCount = countWords(text);
  const lower = text.toLowerCase();
  const hasIntro = STRUCTURE_MARKERS.intro.some((marker) => lower.includes(marker));
  const hasConclusion = STRUCTURE_MARKERS.conclusion.some((marker) =>
    lower.includes(marker),
  );
  const hasTopicSentence = sentences[0]?.length >= 20;

  let score = 50;
  let feedback: string;

  if (prompt) {
    if (wordCount < prompt.word_count_min) {
      score -= 15;
      feedback = `Add more detail to reach the suggested length (${prompt.word_count_min}–${prompt.word_count_max} words). Include one supporting sentence.`;
      return { score: clamp(score, 35, 100), feedback };
    }
    if (wordCount > prompt.word_count_max) {
      score -= 10;
      feedback = `Tighten your writing to stay within ${prompt.word_count_max} words. Remove repeated ideas.`;
      return { score: clamp(score, 35, 100), feedback };
    }
    score += 10;
  }

  if (level === 'advanced' || topic === 'argumentative_essay') {
    if (hasIntro) score += 15;
    if (hasConclusion) score += 15;
    if (paragraphs.length >= 2) score += 10;

    if (hasIntro && hasConclusion) {
      feedback =
        'Strong structure: clear opening, developed body, and a concluding phrase.';
    } else if (!hasIntro) {
      feedback =
        'Begin with a position statement such as "In my opinion" or "I believe".';
    } else {
      feedback =
        'Close with a concluding phrase such as "In conclusion" or "Overall".';
    }
    return { score: clamp(score, 35, 100), feedback };
  }

  if (paragraphs.length > 1) {
    score += 12;
    feedback = 'Good paragraphing. Keep one main idea in each paragraph.';
  } else if (hasTopicSentence && sentences.length >= 3) {
    score += 15;
    feedback =
      'Your paragraph has a clear topic sentence and supporting sentences. Add a short closing line if you can.';
  } else if (sentences.length < 2) {
    score -= 10;
    feedback =
      'Expand with a topic sentence, two supporting sentences, and a brief conclusion.';
  } else {
    score += 5;
    feedback =
      'Use a topic sentence first, then supporting details, then a closing sentence.';
  }

  if (topic === 'short_email' && !lower.includes('dear') && !lower.includes('hello')) {
    score -= 5;
    feedback =
      'For emails, open with a greeting (for example, "Dear..." or "Hello...") and close politely.';
  }

  return { score: clamp(score, 35, 100), feedback };
}

function buildCorrectedText(
  sentences: string[],
  issues: GrammarIssue[],
  tutorFeedback: TutorFeedbackService | undefined,
  userId: string | undefined,
  level: LearnerLevel,
): string {
  if (sentences.length === 0) {
    return '';
  }

  const corrected = sentences.map((sentence, index) => {
    let current = sentence.trim();
    const sentenceIssues = issues.filter((item) => item.sentenceIndex === index);

    if (tutorFeedback) {
      const tutor = tutorFeedback.generateTutorFeedback({
        userId,
        userSentence: current,
        level,
      });
      if (tutor.corrected_sentence.trim()) {
        current = tutor.corrected_sentence.trim();
      }
    }

    current = applyRuleCorrections(current);
    return ensureTerminalPunctuation(current);
  });

  if (sentenceIssuesRemain(issues) && corrected.length === 1) {
    corrected[0] = applyRuleCorrections(corrected[0]!);
  }

  return corrected.join(' ');
}

function applyRuleCorrections(sentence: string): string {
  let result = sentence;

  if (!/^[A-Z]/.test(result) && result.length > 0) {
    result = `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
  }

  result = result.replace(/\ban\s+([b-df-hj-np-tv-z])/gi, 'a $1');
  result = result.replace(/\ba\s+([aeiou])/gi, 'an $1');
  result = result.replace(/\bat\s+monday\b/gi, 'on Monday');
  result = result.replace(/\bon\s+(\d{4})\b/g, 'in $1');

  if (/^(go|walk|run|play|study|work|visit)\b/i.test(result)) {
    result = `I ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
  }

  if (
    /\b(yesterday|last week|last year|ago)\b/i.test(result) &&
    /\b(I|you|we|they|he|she)\s+(walk|play|work|study|go|visit|watch)\b/i.test(
      result,
    )
  ) {
    result = result.replace(
      /\b(walk|play|work|study|go|visit|watch)\b/gi,
      (match) => `${match.toLowerCase()}ed`,
    );
  }

  for (const [wrong, entry] of Object.entries(SPEC_SPELLING_EXAMPLES)) {
    result = result.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), entry.correct);
  }

  return result.replace(/\s+/g, ' ').trim();
}

function buildGrammarFeedback(
  issues: GrammarIssue[],
  original: string,
  corrected: string,
): string {
  if (issues.length === 0) {
    if (original.toLowerCase() !== corrected.toLowerCase()) {
      return 'Small corrections were applied. Your grammar is mostly clear and accurate.';
    }
    return 'Your grammar is clear. Sentence structure and basic rules look accurate.';
  }

  const uniqueRules = [...new Set(issues.map((item) => item.ruleKey))];
  const explanations = uniqueRules
    .slice(0, 3)
    .map((ruleKey) => GRAMMAR_RULE_EXPLANATIONS[ruleKey].rule);

  const summary =
    issues.length === 1
      ? 'There is one grammar pattern to review.'
      : `There are ${issues.length} grammar patterns to review.`;

  return `${summary} ${explanations.join(' ')}`;
}

function buildVocabularyFeedback(
  analysis: ReturnType<typeof analyzeVocabulary>,
  level: LearnerLevel,
): string {
  const varietyPct = Math.round(analysis.uniqueRatio * 100);
  const parts: string[] = [];

  if (analysis.uniqueRatio >= (level === 'advanced' ? 0.68 : 0.6)) {
    parts.push(`Good vocabulary variety (${varietyPct}% unique words).`);
  } else {
    parts.push(
      `Try to increase vocabulary variety (currently ${varietyPct}% unique words). Use synonyms instead of repeating the same words.`,
    );
  }

  if (analysis.repeatedWords.length > 0) {
    parts.push(
      `You repeated "${analysis.repeatedWords.slice(0, 2).join('", "')}" often. Use alternatives for more precision.`,
    );
  }

  if (analysis.basicWordCount > 2) {
    parts.push(
      'Some words are quite basic. Replace words like "good" or "nice" with more precise choices.',
    );
  }

  if (analysis.suggestions.length > 0) {
    parts.push(analysis.suggestions[0]!);
  } else if (analysis.basicWordCount === 0 && analysis.repeatedWords.length === 0) {
    parts.push('Your word choices are precise and appropriate for the task.');
  }

  return parts.join(' ');
}

function scoreGrammar(
  issues: GrammarIssue[],
  corrected: string,
  original: string,
): number {
  let score = 88 - issues.length * 12;
  if (original.toLowerCase() === corrected.toLowerCase()) {
    score += 8;
  }
  return clamp(score, 35, 100);
}

function pickMainWeakness(scores: DimensionScores): WeaknessArea {
  const entries = Object.entries(scores) as Array<[WeaknessArea, number]>;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0]![0];
}

function maybeBuildMicroLesson(
  userId: string,
  topic: WritingTopic,
  overallScore: number,
  weakness: WeaknessArea,
  prompt?: WritingPrompt | null,
): WritingMicroLesson | null {
  if (overallScore >= 78) {
    return null;
  }

  const count = incrementWeakAttempt(userId, topic);
  if (count < WRITING_MICRO_LESSON_THRESHOLD) {
    return null;
  }

  const lesson = MICRO_LESSON_CONTENT[weakness];
  return {
    focus: weakness,
    tip: lesson.tip,
    practice_task:
      prompt?.prompt ??
      `Rewrite your ${topic.replace(/_/g, ' ')} with stronger ${weakness}.`,
    example_paragraph: lesson.example,
  };
}

function measureSentenceFlow(sentences: string[]): number {
  if (sentences.length < 2) {
    return 1;
  }

  let overlapTotal = 0;
  for (let i = 1; i < sentences.length; i += 1) {
    const prev = new Set(
      tokenize(sentences[i - 1]!).filter((word) => !STOP_WORDS.has(word)),
    );
    const current = tokenize(sentences[i]!).filter((word) => !STOP_WORDS.has(word));
    const overlap = current.filter((word) => prev.has(word)).length;
    overlapTotal += current.length === 0 ? 0 : overlap / current.length;
  }

  return overlapTotal / (sentences.length - 1);
}

function dedupeGrammarIssues(issues: GrammarIssue[]): GrammarIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.ruleKey}:${issue.sentenceIndex}:${issue.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sentenceIssuesRemain(issues: GrammarIssue[]): boolean {
  return issues.length > 0;
}

const weakAttemptHistory = new Map<string, number>();

function incrementWeakAttempt(userId: string, topic: WritingTopic): number {
  const key = `${userId}:${topic}`;
  const next = (weakAttemptHistory.get(key) ?? 0) + 1;
  weakAttemptHistory.set(key, next);
  return next;
}

/** @internal Test helper */
export function clearWritingEvaluatorState(): void {
  weakAttemptHistory.clear();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countWords(text: string): number {
  return tokenize(text).length;
}

function ensureTerminalPunctuation(sentence: string): string {
  if (/[.!?]$/.test(sentence)) {
    return sentence;
  }
  return `${sentence}.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

@Injectable()
export class WritingEvaluator {
  constructor(private readonly tutorFeedback: TutorFeedbackService) {}

  evaluateWriting(input: EvaluateWritingInput): SubmitWritingResult {
    return evaluateWriting(
      input.level,
      input.topic,
      input.text,
      {
        userId: input.userId,
        prompt: input.prompt,
      },
      this.tutorFeedback,
    );
  }
}
