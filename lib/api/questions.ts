import { supabase } from '../supabase';
import { Question, QuizQuestion } from '../types';

/**
 * Fetch all Q&A questions from Supabase
 */
export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('category', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch Q&A questions by category
 */
export async function fetchQuestionsByCategory(category: string): Promise<Question[]> {
  if (category === 'All') {
    return fetchQuestions();
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching questions by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all quiz questions from Supabase
 * Maps database snake_case to TypeScript camelCase
 */
export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('category', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map((q: {
    id: string;
    category: string;
    difficulty: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    tags: string[];
  }) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    tags: q.tags,
  }));
}

/**
 * Fetch quiz questions by category and difficulty
 */
export async function fetchQuizQuestionsByFilters(
  category?: string,
  difficulty?: string
): Promise<QuizQuestion[]> {
  let query = supabase.from('quiz_questions').select('*');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (difficulty && difficulty !== 'All') {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query.order('category', { ascending: true });

  if (error) {
    console.error('Error fetching filtered quiz questions:', error);
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map((q: {
    id: string;
    category: string;
    difficulty: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    tags: string[];
  }) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    tags: q.tags,
  }));
}

/**
 * Get list of unique categories from questions
 */
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('category')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const categories = [...new Set(data.map((q: { category: string }) => q.category))];
  return ['All', ...categories];
}

/**
 * Get list of difficulty levels
 */
export function getDifficultyLevels(): string[] {
  return ['All', 'easy', 'medium', 'hard'];
}
