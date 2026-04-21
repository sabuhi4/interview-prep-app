'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  fetchUserProgress,
  upsertQuestionProgress,
  insertQuizResult,
  fetchQuizResults,
  UserProgressData,
} from '@/lib/api/progress';
import { StoredQuizResult } from '@/lib/types';

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getProgressAction(): Promise<UserProgressData> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { bookmarkedIds: [], doneIds: [] };
  return fetchUserProgress(supabase, user.id);
}

export async function upsertProgressAction(
  questionId: string,
  bookmarked: boolean,
  done: boolean
): Promise<{ error: unknown }> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: 'Not authenticated' };
  return upsertQuestionProgress(supabase, user.id, questionId, bookmarked, done);
}

export async function saveQuizResultAction(
  result: Omit<StoredQuizResult, 'id' | 'completedAt'>
): Promise<{ error: unknown }> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: 'Not authenticated' };
  return insertQuizResult(supabase, user.id, result);
}

export async function getQuizResultsAction(): Promise<StoredQuizResult[]> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return [];
  return fetchQuizResults(supabase, user.id);
}
