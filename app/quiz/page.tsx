import { isAuthenticated } from '@/lib/auth';
import { fetchCategories, fetchAllCategoriesAdmin } from '@/lib/api/questions';
import QuizClient from './quiz-client';

export default async function QuizPage() {
  const isAdmin = await isAuthenticated();
  const categories = await (isAdmin ? fetchAllCategoriesAdmin() : fetchCategories());
  return <QuizClient initialCategories={categories} />;
}
