import { EnrichedFeedback } from '../../content/enriched-feedback.interface';

/** Maps enriched feedback fields to API response (camelCase + snake_case). */
export function mapEnrichedFeedbackToApi(
  feedback: Partial<EnrichedFeedback> | null | undefined,
): Record<string, unknown> {
  if (!feedback) {
    return emptyEnrichedApiFields();
  }

  return {
    corrected_sentence: feedback.corrected_sentence ?? '',
    grammar_feedback: feedback.grammar_feedback ?? '',
    vocabulary_feedback: feedback.vocabulary_feedback ?? '',
    comprehension_feedback: feedback.comprehension_feedback ?? '',
    pronunciation_feedback: feedback.pronunciation_feedback ?? '',
    fluency_feedback: feedback.fluency_feedback ?? '',
    coherence_feedback: feedback.coherence_feedback ?? '',
    structure_feedback: feedback.structure_feedback ?? '',
    concept_explanation: feedback.concept_explanation ?? '',
    examples: feedback.examples ?? [],
    counter_examples: feedback.counter_examples ?? [],
    mini_tip: feedback.mini_tip ?? '',
    micro_lesson: feedback.micro_lesson ?? null,
    encouragement: feedback.encouragement ?? '',
    next_step: feedback.next_step ?? '',
  };
}

export function emptyEnrichedApiFields(): Record<string, unknown> {
  return {
    corrected_sentence: '',
    grammar_feedback: '',
    vocabulary_feedback: '',
    comprehension_feedback: '',
    pronunciation_feedback: '',
    fluency_feedback: '',
    coherence_feedback: '',
    structure_feedback: '',
    concept_explanation: '',
    examples: [],
    counter_examples: [],
    mini_tip: '',
    micro_lesson: null,
    encouragement: '',
    next_step: '',
  };
}
