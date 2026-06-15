/**
 * Learner AI controllers are registered via src/ai/ai.module.ts (single /ai route module).
 * This barrel re-exports controller classes for tests and external imports.
 */
export { AiVocabularyController } from './controllers/ai-vocabulary.controller';
export { AiSpeakingController } from './controllers/ai-speaking.controller';
