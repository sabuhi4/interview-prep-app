import { supabase } from '../supabase';
import { Question, QuizQuestion } from '../types';

export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('admin_only', false)
    .order('category', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return data || [];
}

export async function fetchAllQuestionsAdmin(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('category', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return data || [];
}

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
    throw new Error(`Failed to fetch questions by category: ${error.message}`);
  }

  return data || [];
}

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('category', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch quiz questions: ${error.message}`);
  }

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
    throw new Error(`Failed to fetch filtered quiz questions: ${error.message}`);
  }

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

export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('category')
    .eq('admin_only', false)
    .order('category', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = [...new Set(data.map((q: { category: string }) => q.category))];
  return ['All', ...categories];
}

export async function fetchAllCategoriesAdmin(): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('category')
    .order('category', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = [...new Set(data.map((q: { category: string }) => q.category))];
  return ['All', ...categories];
}

export function getDifficultyLevels(): string[] {
  return ['All', 'easy', 'medium', 'hard'];
}
