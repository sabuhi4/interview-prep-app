import { isAuthenticated } from '@/lib/auth';
import { getUser } from '@/lib/user-auth';
import { fetchQuestions, fetchAllQuestionsAdmin } from '@/lib/api/questions';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fetchUserProgress } from '@/lib/api/progress';
import { InitialProgress } from '@/lib/types';
import QuestionsClient from './questions-client';

export default async function QuestionsPage() {
  const [isAdmin, user] = await Promise.all([isAuthenticated(), getUser()]);

  const questions = await (isAdmin ? fetchAllQuestionsAdmin() : fetchQuestions());

  let initialProgress: InitialProgress = { bookmarkedIds: [], doneIds: [] };
  if (user) {
    const supabase = await createSupabaseServerClient();
    initialProgress = await fetchUserProgress(supabase, user.id);
  }

  return (
    <QuestionsClient
      questions={questions}
      isAdmin={isAdmin}
      initialProgress={initialProgress}
      isAuthenticated={!!user}
    />
  );
}
