/**
 * Contract for AI content generation (Phase 2C).
 */
export interface AiContentProvider {
  generateTopic(input: any): Promise<any>;
  generateExplanation(input: any): Promise<any>;
  generateExercises(input: any): Promise<any>;
  generateExamples(input: any): Promise<any>;
  generateVocabulary(input: {
    level: string;
    topic: string;
    userId?: string;
    word?: string;
    count?: number;
  }): Promise<any>;
  generateSpeaking(input: {
    level: string;
    topic: string;
    userId?: string;
    message?: string;
  }): Promise<any>;
  detectLanguage(text: string): Promise<string>;
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
  explainEnglish(
    question: string,
    context?: { translatedQuestion?: string; sourceLanguage?: string },
  ): Promise<{ explanation: string; exampleSentence: string }>;
  textToSpeech(text: string, lang: string): Promise<string>;
  speechToText(
    audioBase64: string,
    options?: { languageHint?: string; mimeType?: string },
  ): Promise<{ text: string; language: string }>;
  evaluateSpeakingPractice(input: {
    prompt: string;
    userResponse: string;
    level?: string;
    language?: string;
  }): Promise<{
    grammarScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    grammarFeedback: string;
    pronunciationFeedback: string;
    overallFeedback: string;
    suggestedImprovement: string;
  }>;
  generatePracticePrompt(input: {
    level?: string;
    language?: string;
  }): Promise<{ promptId: string; prompt: string; exampleAnswer: string }>;
  evaluateSpeakingConfidence(text: string): Promise<{
    grammarScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    clarityScore: number;
    confidenceMarkers: number;
    confidenceScore: number;
    feedback: string;
    encouragement: string;
  }>;
}

export const AI_CONTENT_PROVIDER = Symbol('AI_CONTENT_PROVIDER');
