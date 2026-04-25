import { isAuthenticated } from '@/lib/auth';
import { fetchQuestions, fetchAllQuestionsAdmin } from '@/lib/api/questions';
import FlashcardsClient from './flashcards-client';

export default async function FlashcardsPage() {
  const isAdmin = await isAuthenticated();
  const questions = await (isAdmin ? fetchAllQuestionsAdmin() : fetchQuestions());
  return <FlashcardsClient initialQuestions={questions} />;
}
