export interface TutorContext {
  lessonId?: string;
  level?: string;
  topic?: string;
}

export interface TutorInput {
  userId: string;
  message: string;
  context?: TutorContext;
}

export interface TutorFeedback {
  grammar?: string;
  vocabulary?: string;
  suggestion?: string;
}

export interface TutorResponse {
  reply: string;
  feedback: TutorFeedback;
}

export interface AiTutorService {
  generateTutorResponse(input: TutorInput): Promise<TutorResponse>;
}

export const AI_TUTOR_SERVICE = Symbol('AI_TUTOR_SERVICE');
