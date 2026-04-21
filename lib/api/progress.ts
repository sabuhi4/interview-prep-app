import { SupabaseClient } from '@supabase/supabase-js';
import { StoredQuizResult } from '@/lib/types';

export interface UserProgressData {
  bookmarkedIds: string[];
  doneIds: string[];
}

export async function fetchUserProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProgressData> {
  const { data, error } = await supabase
    .from('user_question_progress')
    .select('question_id, bookmarked, done')
    .eq('user_id', userId);

  if (error || !data) return { bookmarkedIds: [], doneIds: [] };

  return {
    bookmarkedIds: data.filter((r) => r.bookmarked).map((r) => r.question_id),
    doneIds: data.filter((r) => r.done).map((r) => r.question_id),
  };
}

export async function upsertQuestionProgress(
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
  bookmarked: boolean,
  done: boolean
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('user_question_progress').upsert(
    {
      user_id: userId,
      question_id: questionId,
      bookmarked,
      done,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' }
  );

  return { error };
}

export async function insertQuizResult(
  supabase: SupabaseClient,
  userId: string,
  result: Omit<StoredQuizResult, 'id' | 'completedAt'>
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('user_quiz_results').insert({
    user_id: userId,
    score: result.score,
    total_questions: result.totalQuestions,
    percentage: result.percentage,
    category: result.category,
    difficulty: result.difficulty,
  });

  return { error };
}

export async function fetchQuizResults(
  supabase: SupabaseClient,
  userId: string
): Promise<StoredQuizResult[]> {
  const { data, error } = await supabase
    .from('user_quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    score: r.score,
    totalQuestions: r.total_questions,
    percentage: r.percentage,
    category: r.category,
    difficulty: r.difficulty,
    completedAt: r.completed_at,
  }));
}
