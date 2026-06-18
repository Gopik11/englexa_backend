import { PracticeResult, VoiceInputResult } from '../spoken-english.service';

export function normalizePracticeResult(result: PracticeResult): PracticeResult {
  return {
    promptId: result.promptId ?? '',
    prompt: result.prompt ?? 'Introduce yourself in one or two clear sentences.',
    exampleAnswer: result.exampleAnswer ?? '',
    userResponse: result.userResponse ?? '',
    grammarScore: result.grammarScore ?? 0,
    pronunciationScore: result.pronunciationScore ?? 0,
    fluencyScore: result.fluencyScore ?? 0,
    grammarFeedback: result.grammarFeedback ?? '',
    pronunciationFeedback: result.pronunciationFeedback ?? '',
    overallFeedback: result.overallFeedback ?? '',
    suggestedImprovement: result.suggestedImprovement ?? '',
    confidenceTip: result.confidenceTip ?? '',
    confidenceScore: result.confidenceScore ?? 0,
    feedback: result.feedback ?? '',
    encouragement: result.encouragement ?? '',
    audioBase64: result.audioBase64 ?? '',
    localFeedback: result.localFeedback ?? '',
  };
}

export function normalizeVoiceResult(result: VoiceInputResult): VoiceInputResult {
  return {
    english: result.english ?? '',
    local: result.local ?? '',
    audioBase64: result.audioBase64 ?? '',
    confidenceTip: result.confidenceTip ?? '',
    detectedLanguage: result.detectedLanguage ?? 'en',
    translatedQuestion: result.translatedQuestion ?? '',
    transcribedText: result.transcribedText ?? '',
    confidenceScore: result.confidenceScore ?? 0,
    feedback: result.feedback ?? '',
    encouragement: result.encouragement ?? '',
  };
}
