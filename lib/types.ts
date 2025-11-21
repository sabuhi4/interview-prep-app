export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  tags: string[];
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