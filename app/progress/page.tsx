import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { fetchQuestions, fetchCategories } from '@/lib/api/questions';
import { getUser } from '@/lib/user-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fetchUserProgress, fetchQuizResults } from '@/lib/api/progress';
import { ArrowLeft, CheckCircle2, Trophy, Target, TrendingUp, Flame, LogIn } from 'lucide-react';

export default async function ProgressPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="py-12">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Track Your Progress</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Sign in to save your bookmarks, mark questions as done, and track quiz results across devices.
            </p>
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [questions, progress, quizResults] = await Promise.all([
    fetchQuestions(),
    fetchUserProgress(supabase, user.id),
    fetchQuizResults(supabase, user.id),
  ]);

  const categories = await fetchCategories();
  const categoryMap = new Map<string, { total: number; done: number }>();
  for (const q of questions) {
    const entry = categoryMap.get(q.category) ?? { total: 0, done: 0 };
    entry.total++;
    if (progress.doneIds.includes(q.id)) entry.done++;
    categoryMap.set(q.category, entry);
  }

  const categoryStats = Array.from(categoryMap.entries()).map(([name, { total, done }]) => ({
    name,
    total,
    done,
    percentage: total > 0 ? Math.round((done / total) * 100) : 0,
  }));

  const completedQuestions = progress.doneIds.length;
  const overallPercentage =
    questions.length > 0 ? Math.round((completedQuestions / questions.length) * 100) : 0;
  const topicsMastered = categoryStats.filter((c) => c.done === c.total && c.total > 0).length;
  const inProgress = categoryStats.filter((c) => c.done > 0 && c.done < c.total).length;
  const avgScore =
    quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
      : 0;

  const recentResults = quizResults.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track your learning journey and performance</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">
                {completedQuestions} of {questions.length} questions completed
              </span>
              <span className="font-semibold">{overallPercentage}%</span>
            </div>
            <Progress value={overallPercentage} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedQuestions}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{topicsMastered}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Topics Mastered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{inProgress}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg Quiz Score</p>
            </CardContent>
          </Card>
        </div>

        {categories.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Progress by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {cat.done}/{cat.total} ({cat.percentage}%)
                    </span>
                  </div>
                  <Progress value={cat.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {recentResults.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                        result.percentage >= 70
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {result.percentage}%
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.score}/{result.totalQuestions} correct</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 pl-13 sm:pl-0">
                    <Badge variant="outline" className="text-xs">{result.category}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{result.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No quiz results yet. Take a quiz to see your progress!
              </p>
              <Link href="/quiz">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  Take a Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
