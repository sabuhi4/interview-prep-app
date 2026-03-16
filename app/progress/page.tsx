'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/lib/types';
import { fetchQuestions } from '@/lib/api/questions';
import { useProgress } from '@/lib/hooks/useProgress';
import { ArrowLeft, CheckCircle2, Trophy, Target, TrendingUp, Flame } from 'lucide-react';

export default function ProgressPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions().then(setQuestions).finally(() => setLoading(false));
  }, []);

  const { quizResults, stats } = useProgress(questions);

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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track your learning journey and performance</p>
        </div>

        {/* Overall Progress */}
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
                {stats.completedQuestions} of {stats.totalQuestions} questions completed
              </span>
              <span className="font-semibold">{stats.overallPercentage}%</span>
            </div>
            <Progress value={stats.overallPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.completedQuestions}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.topicsMastered}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Topics Mastered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg Quiz Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-Category Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progress by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
            ) : stats.categories.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No data yet. Start answering questions!</p>
            ) : (
              stats.categories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">{cat.done}/{cat.total} ({cat.percentage}%)</span>
                  </div>
                  <Progress value={cat.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Quiz Results */}
        {recentResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${result.percentage >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {result.percentage}%
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.score}/{result.totalQuestions} correct</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{result.category}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{result.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {recentResults.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">No quiz results yet. Take a quiz to see your progress!</p>
              <Link href="/quiz"><Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">Take a Quiz</Button></Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
