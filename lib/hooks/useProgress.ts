'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Question, StoredQuizResult } from '@/lib/types';

export function useProgress(questions: Question[]) {
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage<string[]>('interview-prep:bookmarks', []);
  const [doneIds, setDoneIds] = useLocalStorage<string[]>('interview-prep:done', []);
  const [quizResults, setQuizResults] = useLocalStorage<StoredQuizResult[]>('interview-prep:quiz-results', []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleDone = (id: string) => {
    setDoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveQuizResult = (result: StoredQuizResult) => {
    setQuizResults((prev) => [result, ...prev].slice(0, 50));
  };

  const stats = useMemo(() => {
    const categoryMap = new Map<string, { total: number; done: number }>();
    for (const q of questions) {
      const entry = categoryMap.get(q.category) ?? { total: 0, done: 0 };
      entry.total++;
      if (doneIds.includes(q.id)) entry.done++;
      categoryMap.set(q.category, entry);
    }

    const categories = Array.from(categoryMap.entries()).map(([name, { total, done }]) => ({
      name,
      total,
      done,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
    }));

    const topicsMastered = categories.filter((c) => c.done === c.total && c.total > 0).length;
    const inProgress = categories.filter((c) => c.done > 0 && c.done < c.total).length;
    const avgScore =
      quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
        : 0;

    return {
      categories,
      topicsMastered,
      inProgress,
      avgScore,
      totalQuestions: questions.length,
      completedQuestions: doneIds.length,
      overallPercentage: questions.length > 0 ? Math.round((doneIds.length / questions.length) * 100) : 0,
    };
  }, [questions, doneIds, quizResults]);

  return {
    bookmarkedIds,
    doneIds,
    quizResults,
    toggleBookmark,
    toggleDone,
    saveQuizResult,
    stats,
  };
}
