export type QuestionTrack = 'frontend' | 'business-analyst';

export interface Question {
  id: string;
  track: QuestionTrack;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  tags: string[];
  admin_only?: boolean;
}

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  tags: string[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: { questionId: string; correct: boolean }[];
}

export interface StoredQuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  category: string;
  difficulty: string;
  completedAt: string;
}

export interface InitialProgress {
  bookmarkedIds: string[];
  doneIds: string[];
}

export type StoryTrack = 'po-ba' | 'frontend' | 'both';

export interface Story {
  id: string;
  title: string;
  body: string;
  themes: string[];
  track: StoryTrack;
  display_order: number;
}