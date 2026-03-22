import { isAuthenticated } from '@/lib/auth';
import { fetchQuestions, fetchAllQuestionsAdmin, fetchCategories, fetchAllCategoriesAdmin } from '@/lib/api/questions';
import ListenClient from './listen-client';

export default async function ListenPage() {
  const isAdmin = await isAuthenticated();
  const [questions, categories] = await Promise.all([
    isAdmin ? fetchAllQuestionsAdmin() : fetchQuestions(),
    isAdmin ? fetchAllCategoriesAdmin() : fetchCategories(),
  ]);
  return <ListenClient questions={questions} categories={categories} />;
}
