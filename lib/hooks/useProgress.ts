'use client';

import { useState, useMemo } from 'react';
import { Question, InitialProgress } from '@/lib/types';
import { upsertProgressAction } from '@/app/actions/progress';

export function useProgress(
  questions: Question[],
  initialProgress: InitialProgress = { bookmarkedIds: [], doneIds: [] },
  isAuthenticated: boolean = false
) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(initialProgress.bookmarkedIds);
  const [doneIds, setDoneIds] = useState<string[]>(initialProgress.doneIds);

  const toggleBookmark = (id: string) => {
    if (!isAuthenticated) return;
    const newBookmarked = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((x) => x !== id)
      : [...bookmarkedIds, id];
    const isDone = doneIds.includes(id);
    setBookmarkedIds(newBookmarked);
    upsertProgressAction(id, newBookmarked.includes(id), isDone);
  };

  const toggleDone = (id: string) => {
    if (!isAuthenticated) return;
    const newDone = doneIds.includes(id)
      ? doneIds.filter((x) => x !== id)
      : [...doneIds, id];
    const isBookmarked = bookmarkedIds.includes(id);
    setDoneIds(newDone);
    upsertProgressAction(id, isBookmarked, newDone.includes(id));
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

    return {
      categories,
      topicsMastered,
      inProgress,
      totalQuestions: questions.length,
      completedQuestions: doneIds.length,
      overallPercentage:
        questions.length > 0 ? Math.round((doneIds.length / questions.length) * 100) : 0,
    };
  }, [questions, doneIds]);

  return {
    bookmarkedIds,
    doneIds,
    toggleBookmark,
    toggleDone,
    stats,
    isAuthenticated,
  };
}
