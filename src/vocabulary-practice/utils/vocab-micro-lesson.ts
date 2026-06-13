import { VocabExercise, VocabMicroLesson } from '../interfaces/vocab-exercise.interface';

const DEFAULT_COLLOCATIONS: Record<string, string[]> = {
  default: ['use the word', 'learn the word', 'remember the word'],
};

const TOPIC_COLLOCATIONS: Record<string, string[]> = {
  phrasal_verbs: ['give up easily', 'look after someone', 'run out of time'],
  collocations: ['make a decision', 'take a break', 'pay attention'],
  idioms: ['break the ice', 'under the weather', 'on the same page'],
  topic_travel: ['check in', 'boarding pass', 'book in advance'],
  topic_business: ['cash flow', 'stakeholder meeting', 'due diligence'],
  topic_technology: ['cloud computing', 'machine learning', 'two-factor authentication'],
  academic_words: ['strong evidence', 'research hypothesis', 'peer review'],
};

export function generateVocabMicroLesson(
  word: string,
  topic: string,
  exercise: Pick<VocabExercise, 'explanation' | 'example_sentence'>,
): VocabMicroLesson {
  const meaning = buildMeaning(word, exercise.explanation);
  const collocations = buildCollocations(word, topic, exercise.explanation);

  return {
    word,
    meaning,
    collocations,
    example_sentence: exercise.example_sentence,
  };
}

function buildMeaning(word: string, explanation: string): string {
  const trimmed = explanation.trim();
  if (trimmed.length === 0) {
    return `"${word}" is an important word to learn in context.`;
  }

  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed;
  return firstSentence;
}

function buildCollocations(
  word: string,
  topic: string,
  explanation: string,
): string[] {
  const topicSet = TOPIC_COLLOCATIONS[topic] ?? DEFAULT_COLLOCATIONS.default;
  const fromExplanation = extractCollocationHints(explanation, word);

  const combined = [
    ...fromExplanation,
    ...topicSet.slice(0, 2),
    `use "${word}" correctly`,
  ];

  return [...new Set(combined)].slice(0, 3);
}

function extractCollocationHints(explanation: string, word: string): string[] {
  const hints: string[] = [];
  const patterns = [
    /We (?:often )?say "([^"]+)"/i,
    /(?:Use|Try) "([^"]+)"/i,
    /pairs with ([^.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = explanation.match(pattern);
    if (match?.[1]) {
      hints.push(match[1].trim());
    }
  }

  if (hints.length === 0 && word.length > 0) {
    hints.push(`common ${word} phrases`);
  }

  return hints;
}
