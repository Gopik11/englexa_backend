export interface AnalyticsDashboard {
  xp: number;
  level: number;
  streak: number;
  grammar: {
    accuracy: number;
    concept_mastery: Record<string, number>;
    recent_mistakes: string[];
    trend: number;
  };
  vocabulary: {
    words_learned: number;
    retention_rate: number;
    weak_words: string[];
    trend: number;
  };
  reading: {
    passages_completed: number;
    comprehension_accuracy: number;
    trend: number;
  };
  speaking: {
    pronunciation_score: number;
    fluency_score: number;
    trend: number;
  };
  writing: {
    grammar_score: number;
    coherence_score: number;
    structure_score: number;
    trend: number;
  };
  weekly_activity: {
    days_active: number;
    minutes_spent: number;
    modules_used: string[];
  };
  heatmap: number[][];
  recommendations: Array<{
    module: string;
    concept: string;
    reason: string;
  }>;
  weakest_concepts: Array<{
    module: string;
    concept: string;
    mastery_score: number;
  }>;
  strongest_concepts: Array<{
    module: string;
    concept: string;
    mastery_score: number;
  }>;
  trends: {
    grammar: number[];
    vocabulary: number[];
    reading: number[];
    speaking: number[];
    writing: number[];
  };
  top_error_patterns: Array<{
    module: string;
    concept: string;
    error_type: string;
    count: number;
    last_seen: string;
    examples: string[];
  }>;
  prediction_recommendations: Array<{
    module: string;
    concept: string;
    predicted_difficulty: number;
    probability_correct: number;
    needs_review: boolean;
    needs_mini_lesson: boolean;
    recommended_action: string;
    timestamp: string;
  }>;
  srs_status: {
    total_items: number;
    due_count: number;
    reviewed_today: number;
    upcoming_count: number;
  };
  daily_challenge: {
    date: string;
    completed: boolean;
    score?: number;
    challenge: {
      type: string;
      concept: string;
      difficulty: number;
      question: string;
      options?: string[];
      prompt?: string;
      source?: string;
    };
  } | null;
  recommended_mini_lessons: Array<{
    id: string;
    concept: string;
    module: string;
    difficulty_level: number;
    title: string;
    explanation: string;
    examples: string[];
    common_mistakes: string[];
    quick_practice: Array<{
      question: string;
      options: string[];
      answer: string;
    }>;
    estimated_time: number;
    completed?: boolean;
  }>;
}
