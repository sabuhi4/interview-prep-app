import { supabase } from '../supabase';
import { Question, QuizQuestion } from '../types';

export async function createQuestion(question: Omit<Question, 'id'>): Promise<{ data: Question | null; error: unknown }> {
  const { data, error } = await supabase
    .from('questions')
    .insert([question])
    .select()
    .single();

  return { data, error };
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<{ data: Question | null; error: unknown }> {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteQuestion(id: string): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  return { error };
}

export async function createQuizQuestion(question: Omit<QuizQuestion, 'id'>): Promise<{ data: QuizQuestion | null; error: unknown }> {
  const dbQuestion = {
    category: question.category,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options,
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
    tags: question.tags,
  };

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert([dbQuestion])
    .select()
    .single();

  return { data, error };
}

export async function updateQuizQuestion(id: string, updates: Partial<QuizQuestion>): Promise<{ data: QuizQuestion | null; error: unknown }> {
  const dbUpdates: Record<string, string | number | string[] | undefined> = { ...updates };
  if (updates.correctAnswer !== undefined) {
    dbUpdates.correct_answer = updates.correctAnswer;
    delete dbUpdates.correctAnswer;
  }

  const { data, error } = await supabase
    .from('quiz_questions')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteQuizQuestion(id: string): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', id);

  return { error };
}

export function generateQuestionId(category: string, type: 'question' | 'quiz'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  const prefix = type === 'quiz' ? 'quiz' : category.toLowerCase().replace(/\s+/g, '-');
  return `${prefix}-${timestamp}-${random}`;
}

export function validateQuestion(question: Partial<Question>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!question.category?.trim()) errors.push('Category is required');
  if (!question.difficulty) errors.push('Difficulty is required');
  if (!question.question?.trim()) errors.push('Question text is required');
  if (!question.answer?.trim()) errors.push('Answer is required');
  if (!question.tags || question.tags.length === 0) errors.push('At least one tag is required');

  return { valid: errors.length === 0, errors };
}

export function validateQuizQuestion(question: Partial<QuizQuestion>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!question.category?.trim()) errors.push('Category is required');
  if (!question.difficulty) errors.push('Difficulty is required');
  if (!question.question?.trim()) errors.push('Question text is required');
  if (!question.options || question.options.length !== 4) errors.push('Exactly 4 options are required');
  if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer > 3) {
    errors.push('Valid correct answer (0-3) is required');
  }
  if (!question.explanation?.trim()) errors.push('Explanation is required');
  if (!question.tags || question.tags.length === 0) errors.push('At least one tag is required');

  return { valid: errors.length === 0, errors };
}