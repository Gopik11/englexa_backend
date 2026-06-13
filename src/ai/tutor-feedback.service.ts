import { Injectable, Logger } from '@nestjs/common';
import {
  ENCOURAGEMENT_BY_LEVEL,
  fillTemplate,
  GRAMMAR_TEMPLATES,
  LearnerLevel,
  MICRO_LESSON_THRESHOLD,
  MICRO_LESSONS,
  MistakeCategory,
  NEXT_STEP_TEMPLATES,
  SPEC_SPELLING_EXAMPLES,
  VOCABULARY_SUGGESTIONS,
  VOCABULARY_TEMPLATES,
} from '../content/englexa-content-spec.constants';
import { buildEnrichedFeedback } from '../content/feedback-enrichment';
import {
  GenerateTutorFeedbackInput,
  TutorFeedbackJson,
} from './interfaces/tutor-feedback.interface';

interface SentenceAnalysis {
  category: MistakeCategory;
  mistakeKey: string;
  correctedSentence: string;
  grammarFeedback: string;
  wrongWord?: string;
  correctWord?: string;
}

@Injectable()
export class TutorFeedbackService {
  private readonly logger = new Logger(TutorFeedbackService.name);

  /** userId → mistakeKey → occurrence count (for micro-lesson triggers) */
  private readonly mistakeHistory = new Map<string, Map<string, number>>();

  generateTutorFeedback(input: GenerateTutorFeedbackInput): TutorFeedbackJson {
    const userSentence = input.userSentence.trim();
    const level = input.level ?? 'intermediate';
    const analysis = this.analyzeSentence(userSentence);

    const microLesson = this.resolveMicroLesson(
      input.userId,
      analysis.mistakeKey,
      analysis.category,
    );

    const vocabularyFeedback = this.buildVocabularyFeedback(
      userSentence,
      analysis.correctedSentence,
      level,
    );

    const encouragement = ENCOURAGEMENT_BY_LEVEL[level];
    const nextStep = this.pickNextStep(analysis.category, userSentence);

    const enriched = buildEnrichedFeedback({
      userId: input.userId ?? 'anonymous',
      level,
      isCorrect: false,
      conceptKey: this.categoryToRuleKey(analysis.category),
      correctedSentence: analysis.correctedSentence,
      grammarFeedback: analysis.grammarFeedback,
      vocabularyFeedback,
      microLesson: microLesson,
      nextStep,
    });

    const result: TutorFeedbackJson = {
      corrected_sentence: analysis.correctedSentence,
      grammar_feedback: analysis.grammarFeedback,
      vocabulary_feedback: vocabularyFeedback,
      concept_explanation: enriched.concept_explanation ?? '',
      examples: enriched.examples ?? [],
      counter_examples: enriched.counter_examples ?? [],
      mini_tip: enriched.mini_tip ?? '',
      encouragement: enriched.encouragement ?? encouragement,
      next_step: enriched.next_step ?? nextStep,
      micro_lesson: microLesson,
    };

    this.logger.log(
      `level=${level} sentenceLen=${userSentence.length} microLesson=${microLesson != null}`,
    );

    return result;
  }

  private analyzeSentence(userSentence: string): SentenceAnalysis {
    const spelling = this.detectSpelling(userSentence);
    if (spelling) {
      return spelling;
    }

    const article = this.detectArticleError(userSentence);
    if (article) {
      return article;
    }

    const tense = this.detectVerbTenseError(userSentence);
    if (tense) {
      return tense;
    }

    const preposition = this.detectPrepositionError(userSentence);
    if (preposition) {
      return preposition;
    }

    const missingSubject = this.detectMissingSubject(userSentence);
    if (missingSubject) {
      return missingSubject;
    }

    return this.buildGeneralCorrection(userSentence);
  }

  private detectSpelling(userSentence: string): SentenceAnalysis | null {
    const words = userSentence.split(/\s+/);

    for (const word of words) {
      const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
      const specEntry = SPEC_SPELLING_EXAMPLES[normalized];
      if (!specEntry) {
        continue;
      }

      const correctedSentence = userSentence.replace(
        new RegExp(`\\b${word}\\b`, 'i'),
        specEntry.correct,
      );

      const grammarFeedback = fillTemplate(GRAMMAR_TEMPLATES.spellingCorrection, {
        wrong_word: word,
        correct_word: specEntry.correct,
        example_sentence: specEntry.exampleSentence,
      });

      return {
        category: 'spelling',
        mistakeKey: `spelling_${normalized}`,
        correctedSentence,
        grammarFeedback: `${grammarFeedback}\n${specEntry.ruleExplanation} Correct version: "${correctedSentence}".`,
        wrongWord: word,
        correctWord: specEntry.correct,
      };
    }

    return null;
  }

  private detectArticleError(userSentence: string): SentenceAnalysis | null {
    const anBeforeConsonant = userSentence.match(
      /\ban\s+([b-df-hj-np-tv-z])/i,
    );
    if (anBeforeConsonant) {
      const correctedSentence = userSentence.replace(/\ban\b/i, 'a');
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'article',
        MICRO_LESSONS.article.mistakeKey,
        'Use "a" before consonant sounds and "an" before vowel sounds.',
        'I read a book every day.',
      );
    }

    const aBeforeVowel = userSentence.match(/\ba\s+([aeiou])/i);
    if (aBeforeVowel) {
      const correctedSentence = userSentence.replace(/\ba\b/i, 'an');
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'article',
        MICRO_LESSONS.article.mistakeKey,
        'Use "an" before vowel sounds.',
        'I ate an apple for lunch.',
      );
    }

    const missingArticle = userSentence.match(
      /\b(I|you|we|they)\s+(want|need|have|buy|see)\s+([a-z]+)\b/i,
    );
    if (
      missingArticle &&
      !/\b(a|an|the)\s+/i.test(
        userSentence.slice(userSentence.indexOf(missingArticle[2])),
      ) &&
      !['to', 'some', 'more'].includes(missingArticle[3].toLowerCase())
    ) {
      const noun = missingArticle[3];
      const article = /^[aeiou]/i.test(noun) ? 'an' : 'a';
      const correctedSentence = userSentence.replace(
        new RegExp(`\\b${missingArticle[2]}\\s+${noun}\\b`, 'i'),
        `${missingArticle[2]} ${article} ${noun}`,
      );
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'article',
        MICRO_LESSONS.article.mistakeKey,
        'Use "a" before consonant sounds and "an" before vowel sounds.',
        `I want ${article} ${noun}.`,
      );
    }

    return null;
  }

  private detectVerbTenseError(userSentence: string): SentenceAnalysis | null {
    const pastTimeWord = /\b(yesterday|last week|last year|ago)\b/i.test(
      userSentence,
    );
    const presentVerb = userSentence.match(
      /\b(I|you|we|they|he|she)\s+(walk|play|work|study|go|visit|watch)\b/i,
    );

    if (pastTimeWord && presentVerb) {
      const verb = presentVerb[2].toLowerCase();
      const pastForm = `${verb}ed`;
      const correctedSentence = userSentence.replace(
        new RegExp(`\\b${verb}\\b`, 'i'),
        pastForm,
      );

      const grammarFeedback = fillTemplate(GRAMMAR_TEMPLATES.verbTenseCorrection, {
        corrected_sentence: correctedSentence,
        tense_rule: 'the past tense when the sentence refers to a finished time',
      });

      return {
        category: 'verb_tense',
        mistakeKey: MICRO_LESSONS.verb_tense.mistakeKey,
        correctedSentence,
        grammarFeedback,
      };
    }

    return null;
  }

  private detectPrepositionError(userSentence: string): SentenceAnalysis | null {
    if (/\bat\s+monday\b/i.test(userSentence)) {
      const correctedSentence = userSentence.replace(/\bat\s+monday\b/i, 'on Monday');
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'preposition',
        MICRO_LESSONS.preposition.mistakeKey,
        'Use "on" for days and dates.',
        'I have a meeting on Monday.',
      );
    }

    if (/\bon\s+\d{4}\b/.test(userSentence)) {
      const correctedSentence = userSentence.replace(/\bon\s+(\d{4})\b/, 'in $1');
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'preposition',
        MICRO_LESSONS.preposition.mistakeKey,
        'Use "in" for years.',
        'I started learning English in 2024.',
      );
    }

    if (/\bin\s+\d{1,2}\s*(am|pm)\b/i.test(userSentence)) {
      const correctedSentence = userSentence.replace(/\bin\b/i, 'at');
      return this.buildGrammarAnalysis(
        userSentence,
        correctedSentence,
        'preposition',
        MICRO_LESSONS.preposition.mistakeKey,
        'Use "at" for specific times.',
        'I study at 5 PM.',
      );
    }

    return null;
  }

  private detectMissingSubject(userSentence: string): SentenceAnalysis | null {
    const fragment = userSentence.match(
      /^(go|walk|run|play|study|work|visit)\b/i,
    );
    if (fragment) {
      const correctedSentence = `I ${userSentence.charAt(0).toLowerCase()}${userSentence.slice(1)}`;
      const grammarFeedback = fillTemplate(GRAMMAR_TEMPLATES.missingSubject, {
        corrected_sentence: correctedSentence,
        example_sentence: 'I go to school every day.',
      });

      return {
        category: 'missing_subject',
        mistakeKey: 'missing_subject',
        correctedSentence,
        grammarFeedback,
      };
    }

    return null;
  }

  private buildGeneralCorrection(userSentence: string): SentenceAnalysis {
    const grammarFeedback = fillTemplate(GRAMMAR_TEMPLATES.simpleCorrection, {
      user_sentence: userSentence,
      corrected_sentence: userSentence,
      rule_explanation: 'your sentence structure is clear and complete',
      example_sentence: userSentence,
    });

    return {
      category: 'general',
      mistakeKey: 'general',
      correctedSentence: userSentence,
      grammarFeedback,
    };
  }

  private buildGrammarAnalysis(
    userSentence: string,
    correctedSentence: string,
    category: MistakeCategory,
    mistakeKey: string,
    ruleExplanation: string,
    exampleSentence: string,
  ): SentenceAnalysis {
    const grammarFeedback = fillTemplate(GRAMMAR_TEMPLATES.simpleCorrection, {
      user_sentence: userSentence,
      corrected_sentence: correctedSentence,
      rule_explanation: ruleExplanation,
      example_sentence: exampleSentence,
    });

    return {
      category,
      mistakeKey,
      correctedSentence,
      grammarFeedback,
    };
  }

  private buildVocabularyFeedback(
    userSentence: string,
    correctedSentence: string,
    level: LearnerLevel,
  ): string {
    if (level === 'beginner') {
      return fillTemplate(VOCABULARY_TEMPLATES.alternativeWord, {
        alternative_word: 'a simple word',
        example_sentence: correctedSentence,
      });
    }

    for (const suggestion of VOCABULARY_SUGGESTIONS) {
      if (!suggestion.pattern.test(userSentence)) {
        continue;
      }

      if (level === 'advanced' && suggestion.strongerWord) {
        return fillTemplate(VOCABULARY_TEMPLATES.strongerVocabulary, {
          stronger_word: suggestion.strongerWord,
          example_sentence: suggestion.exampleSentence,
        });
      }

      if (suggestion.naturalSentence) {
        return fillTemplate(VOCABULARY_TEMPLATES.naturalExpression, {
          natural_sentence: suggestion.naturalSentence,
        });
      }

      return fillTemplate(VOCABULARY_TEMPLATES.alternativeWord, {
        alternative_word: suggestion.alternativeWord ?? suggestion.strongerWord ?? 'another word',
        example_sentence: suggestion.exampleSentence,
      });
    }

    if (level === 'advanced') {
      return fillTemplate(VOCABULARY_TEMPLATES.naturalExpression, {
        natural_sentence: correctedSentence,
      });
    }

    return fillTemplate(VOCABULARY_TEMPLATES.alternativeWord, {
      alternative_word: 'another useful word',
      example_sentence: correctedSentence,
    });
  }

  private pickNextStep(
    category: MistakeCategory,
    userSentence: string,
  ): string {
    if (category === 'verb_tense') {
      return NEXT_STEP_TEMPLATES[1];
    }
    if (category === 'spelling') {
      return NEXT_STEP_TEMPLATES[0];
    }
    if (category === 'article' || category === 'preposition') {
      return NEXT_STEP_TEMPLATES[2];
    }

    const index = userSentence.length % NEXT_STEP_TEMPLATES.length;
    return NEXT_STEP_TEMPLATES[index];
  }

  private resolveMicroLesson(
    userId: string | undefined,
    mistakeKey: string,
    category: MistakeCategory,
  ): string | null {
    if (!userId || category === 'general' || category === 'missing_subject') {
      return null;
    }

    if (category === 'spelling') {
      return null;
    }

    const lesson =
      category === 'article'
        ? MICRO_LESSONS.article
        : category === 'verb_tense'
          ? MICRO_LESSONS.verb_tense
          : category === 'preposition'
            ? MICRO_LESSONS.preposition
            : null;

    if (!lesson) {
      return null;
    }

    const count = this.recordMistake(userId, mistakeKey);
    return count >= MICRO_LESSON_THRESHOLD ? lesson.text : null;
  }

  private recordMistake(userId: string, mistakeKey: string): number {
    if (!this.mistakeHistory.has(userId)) {
      this.mistakeHistory.set(userId, new Map());
    }

    const userMistakes = this.mistakeHistory.get(userId)!;
    const nextCount = (userMistakes.get(mistakeKey) ?? 0) + 1;
    userMistakes.set(mistakeKey, nextCount);
    return nextCount;
  }

  private categoryToRuleKey(category: MistakeCategory): string {
    const map: Record<MistakeCategory, string> = {
      article: 'article',
      verb_tense: 'verb_tense',
      preposition: 'preposition',
      missing_subject: 'missing_subject',
      spelling: 'article',
      general: 'simple_present',
    };
    return map[category];
  }
}
