import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { ENRICHMENT_ENCOURAGEMENT_TEMPLATES } from '../../content/englexa-content-spec.constants';
import { MasteryModule } from '../../mastery/entities/concept-mastery.entity';

export type SummaryModule = MasteryModule;

export interface SessionSummaryInput {
  module: SummaryModule;
  level?: LearnerLevel;
  sessionData: Record<string, unknown>;
  weakConcepts?: string[];
  recommendedConcept?: string;
}

export interface LessonSummaryResult {
  summary: string;
  key_points: string[];
  mistakes: string[];
  improvements: string[];
  next_steps: string[];
  motivation: string;
}

export function generateLessonSummary(
  input: SessionSummaryInput,
): LessonSummaryResult {
  const level = input.level ?? 'intermediate';
  const data = input.sessionData;
  const correct = numberField(data, 'correct_count', 'correctCount');
  const total = numberField(data, 'total_count', 'totalCount', 'questions_answered');
  const topic = stringField(data, 'topic', 'concept') ?? input.module;
  const topicLabel = topic.replace(/_/g, ' ');

  const accuracy =
    total > 0 ? Math.round((correct / total) * 100) : correct > 0 ? 100 : 0;

  const mistakes = extractMistakes(data, input.weakConcepts);
  const keyPoints = buildKeyPoints(input.module, topicLabel, accuracy, data);
  const improvements = buildImprovements(input.module, mistakes, accuracy);
  const nextSteps = buildNextSteps(
    input.module,
    input.recommendedConcept ?? topic,
    mistakes,
  );
  const summary = buildSummaryParagraph(
    input.module,
    topicLabel,
    accuracy,
    correct,
    total,
    level,
  );
  const motivation = pickMotivation(level);

  return {
    summary,
    key_points: keyPoints,
    mistakes,
    improvements,
    next_steps: nextSteps,
    motivation,
  };
}

function buildSummaryParagraph(
  module: SummaryModule,
  topicLabel: string,
  accuracy: number,
  correct: number,
  total: number,
  level: LearnerLevel,
): string {
  const moduleLabel = module.replace(/_/g, ' ');
  const attemptLine =
    total > 0
      ? `You answered ${correct} of ${total} items correctly (${accuracy}% accuracy).`
      : `You completed a ${moduleLabel} practice session focused on ${topicLabel}.`;

  return [
    `Today you worked on ${moduleLabel}, with a focus on ${topicLabel}.`,
    attemptLine,
    accuracy >= 80
      ? `Your accuracy shows solid understanding at the ${level} level.`
      : `There is clear room to grow — mistakes are part of the learning process.`,
    `Review the patterns below and apply them in your next short practice block.`,
    `Consistent practice will move ${topicLabel} from familiar to automatic.`,
  ].join(' ');
}

function buildKeyPoints(
  module: SummaryModule,
  topicLabel: string,
  accuracy: number,
  data: Record<string, unknown>,
): string[] {
  const points: string[] = [
    `Focus concept: ${topicLabel}`,
    `Session accuracy: ${accuracy}%`,
  ];

  switch (module) {
    case 'grammar':
      points.push('Notice article and tense patterns in every sentence you write.');
      points.push('Read your answer aloud to catch missing words quickly.');
      break;
    case 'vocabulary':
      points.push('Reuse new words in a fresh sentence within 24 hours.');
      points.push('Group words by topic to strengthen memory links.');
      break;
    case 'reading':
      points.push('Underline clue words before choosing an answer.');
      points.push('Summarize each paragraph in one sentence.');
      break;
    case 'speaking':
      points.push('Slow down slightly on stressed syllables.');
      points.push('Pause between ideas instead of filling gaps with filler words.');
      break;
    case 'writing':
      points.push('Use one linking word per paragraph (however, therefore, for example).');
      points.push('Check subject–verb agreement in your final read-through.');
      break;
  }

  const words = data['words_practiced'];
  if (Array.isArray(words) && words.length > 0) {
    points.push(`Words practised: ${words.slice(0, 5).join(', ')}`);
  }

  return points.slice(0, 5);
}

function buildImprovements(
  module: SummaryModule,
  mistakes: string[],
  accuracy: number,
): string[] {
  const items: string[] = [];

  if (accuracy < 70) {
    items.push('Slow down and read each prompt twice before answering.');
  }
  if (mistakes.length > 0) {
    items.push(
      `Revisit: ${mistakes.slice(0, 2).map((m) => m.replace(/_/g, ' ')).join(', ')}`,
    );
  }

  switch (module) {
    case 'grammar':
      items.push('Write two new sentences using today\'s grammar pattern.');
      break;
    case 'vocabulary':
      items.push('Create a mini story using three words from this session.');
      break;
    case 'reading':
      items.push('Re-read the passage and note one new phrase.');
      break;
    case 'speaking':
      items.push('Record a 30-second recap of what you practised.');
      break;
    case 'writing':
      items.push('Rewrite one paragraph with clearer paragraph breaks.');
      break;
  }

  return items.slice(0, 4);
}

function buildNextSteps(
  module: SummaryModule,
  concept: string,
  mistakes: string[],
): string[] {
  const label = concept.replace(/_/g, ' ');
  const steps = [
    `Practise ${label} for 5 minutes tomorrow.`,
    `Return to ${module} and aim for one more correct answer than today.`,
  ];

  if (mistakes.length > 0) {
    steps.push(`Drill the concept: ${mistakes[0]!.replace(/_/g, ' ')}.`);
  }

  steps.push('Check your Skills Hub recommendation after this session.');
  return steps.slice(0, 4);
}

function extractMistakes(
  data: Record<string, unknown>,
  weakConcepts?: string[],
): string[] {
  const errorPatterns = data['error_patterns'];
  if (Array.isArray(errorPatterns) && errorPatterns.length > 0) {
    return errorPatterns
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const type = String(record['error_type'] ?? 'pattern').replace(/_/g, ' ');
        const concept = String(record['concept'] ?? '').replace(/_/g, ' ');
        return concept ? `${concept}: ${type}` : type;
      })
      .filter((item): item is string => Boolean(item))
      .slice(0, 5);
  }

  const fromData = data['mistakes'] ?? data['concepts_missed'];
  if (Array.isArray(fromData)) {
    return fromData.map((item) => String(item)).slice(0, 5);
  }

  const history = data['history'];
  if (Array.isArray(history)) {
    return history
      .filter((item) => item && typeof item === 'object' && item['is_correct'] === false)
      .map((item) => String(item['concept'] ?? item['topic'] ?? 'pattern'))
      .slice(0, 5);
  }

  return (weakConcepts ?? []).slice(0, 5);
}

function pickMotivation(level: LearnerLevel): string {
  const templates = ENRICHMENT_ENCOURAGEMENT_TEMPLATES[level];
  return templates[0] ?? 'Great effort — keep showing up and progress will follow.';
}

function numberField(
  data: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number') {
      return value;
    }
  }
  return 0;
}

function stringField(
  data: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
}
