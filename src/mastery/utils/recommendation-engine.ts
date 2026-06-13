import {
  ConceptMastery,
  MasteryModule,
  MasteryRecommendation,
} from '../entities/concept-mastery.entity';
import { compareWeakest } from './mastery-rules';

const MODULE_LABELS: Record<MasteryModule, string> = {
  grammar: 'grammar',
  vocabulary: 'vocabulary',
  reading: 'reading',
  speaking: 'speaking',
  writing: 'writing',
};

export function buildRecommendation(
  concepts: ConceptMastery[],
  userLevel: string,
): MasteryRecommendation {
  const sorted = [...concepts].sort(compareWeakest);
  const target =
    sorted.find((item) => item.band === 'weak' || item.band === 'developing') ??
    sorted[0] ??
    defaultConcept(userLevel);

  const module = target.module;
  const concept = target.concept;

  return {
    recommended_module: module,
    recommended_concept: concept,
    reason: buildReason(target),
    next_exercise: buildNextExercise(module, concept, userLevel),
  };
}

function buildReason(concept: ConceptMastery): string {
  if (concept.masteryScore === 0) {
    return `You have not practised ${concept.concept.replace(/_/g, ' ')} yet — a great place to start.`;
  }
  if (concept.band === 'weak') {
    return `${concept.concept.replace(/_/g, ' ')} needs attention — accuracy is ${concept.masteryScore}%.`;
  }
  if (concept.band === 'developing') {
    return `Keep building ${concept.concept.replace(/_/g, ' ')} — you are at ${concept.masteryScore}% mastery.`;
  }
  return `Maintain your strength in ${concept.concept.replace(/_/g, ' ')} with a quick review.`;
}

function buildNextExercise(
  module: MasteryModule,
  concept: string,
  userLevel: string,
): Record<string, unknown> {
  return {
    module: MODULE_LABELS[module],
    concept,
    level: userLevel,
    route: `/${module === 'grammar' ? 'grammar' : module}/practice`,
    query: { topic: concept },
  };
}

function defaultConcept(userLevel: string): ConceptMastery {
  return {
    module: 'grammar',
    concept: 'articles',
    correctCount: 0,
    mistakeCount: 0,
    masteryScore: 0,
    band: 'weak',
    timeSpentMs: 0,
    difficulty: 1,
  };
}
