import { isAuthenticated } from '@/lib/auth';
import { fetchQuestions, fetchAllQuestionsAdmin, fetchCategories, fetchAllCategoriesAdmin } from '@/lib/api/questions';
import FlashcardsClient from './flashcards-client';

export default async function FlashcardsPage() {
  const isAdmin = await isAuthenticated();
  const [questions, categories] = await Promise.all([
    isAdmin ? fetchAllQuestionsAdmin() : fetchQuestions(),
    isAdmin ? fetchAllCategoriesAdmin() : fetchCategories(),
  ]);
  return <FlashcardsClient initialQuestions={questions} initialCategories={categories} />;
}
