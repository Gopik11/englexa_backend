import { GrammarExercise } from '../interfaces/grammar-exercise.interface';
import { generateMicroLesson } from './micro-lesson-generator';

export function buildGrammarFeedback(params: {
  userAnswer: string;
  correctAnswer: string;
  concept: string;
  exercise: GrammarExercise;
}): string {
  const { userAnswer, correctAnswer, concept, exercise } = params;
  const lesson = generateMicroLesson(concept);
  const learnerText = userAnswer.trim() || '(no answer)';
  const correct = correctAnswer.trim();
  const example =
    lesson.examples[0] ?? extractExampleFromExercise(exercise) ?? correct;

  const whatYouWrote = `Nice try! You wrote: '${learnerText}'.`;
  const rule = `Rule (${concept}): ${lesson.explanation}`;
  const why = buildWhyCorrection(concept, learnerText, correct);
  const exampleLine = `Example: ${example}`;

  return [whatYouWrote, rule, why, exampleLine].join(' ');
}

function buildWhyCorrection(
  concept: string,
  learnerText: string,
  correct: string,
): string {
  if (learnerText === correct) {
    return `Why: Check the ${concept} pattern carefully — your answer needs a small adjustment to match the expected form '${correct}'.`;
  }

  return `Why: Your answer '${learnerText}' does not follow the ${concept} pattern yet, so the correct form is '${correct}'.`;
}

function extractExampleFromExercise(exercise: GrammarExercise): string | null {
  const match = exercise.explanation.match(/Example:\s*(.+?)\.?\s*$/i);
  return match?.[1]?.trim() ?? null;
}
