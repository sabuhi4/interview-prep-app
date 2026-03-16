'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Question } from '@/lib/types';
import { fetchQuestions, fetchCategories, getDifficultyLevels } from '@/lib/api/questions';
import { useProgress } from '@/lib/hooks/useProgress';
import { ArrowLeft, Search, Loader2, Bookmark, CheckCircle, ChevronDown } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [difficulties] = useState<string[]>(getDifficultyLevels());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showBookmarked, setShowBookmarked] = useState(false);

  const { bookmarkedIds, doneIds, toggleBookmark, toggleDone } = useProgress(questions);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [questionsData, categoriesData] = await Promise.all([
          fetchQuestions(),
          fetchCategories(),
        ]);
        setQuestions(questionsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesBookmark = !showBookmarked || bookmarkedIds.includes(q.id);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesBookmark;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interview Questions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Browse through comprehensive interview questions with detailed answers
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input placeholder="Search questions, answers, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="w-full justify-start flex-wrap h-auto">
                    {categories.map((cat) => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <TabsList className="w-full justify-start">
                    {difficulties.map((diff) => <TabsTrigger key={diff} value={diff} className="capitalize">{diff}</TabsTrigger>)}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={showBookmarked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowBookmarked(!showBookmarked)}
                  className="gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${showBookmarked ? 'fill-current' : ''}`} />
                  Bookmarked ({bookmarkedIds.length})
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {doneIds.length} of {questions.length} done
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">No questions found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredQuestions.map((q, index) => {
              const isBookmarked = bookmarkedIds.includes(q.id);
              const isDone = doneIds.includes(q.id);
              return (
                <AccordionItem key={q.id} value={q.id} className="border-0">
                  <Card>
                    <div className="flex items-stretch">
                      <AccordionPrimitive.Header asChild>
                        <div className="flex-1 min-w-0">
                          <AccordionPrimitive.Trigger className="flex w-full items-start gap-4 text-left px-6 py-4 hover:no-underline group [&[data-state=open]>svg:last-child]:rotate-180">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mt-0.5">
                              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 items-center">
                                <Badge variant="outline">{q.category}</Badge>
                                <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                                {isDone && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Done</Badge>}
                              </div>
                              <h3 className="text-lg font-semibold">{q.question}</h3>
                            </div>
                            <ChevronDown className="w-4 h-4 mt-1 flex-shrink-0 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </AccordionPrimitive.Trigger>
                        </div>
                      </AccordionPrimitive.Header>

                      <div
                        className="flex flex-col justify-center gap-1 px-3 border-l border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 ${isBookmarked ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          onClick={() => toggleBookmark(q.id)}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 ${isDone ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          onClick={() => toggleDone(q.id)}
                          title={isDone ? 'Mark as not done' : 'Mark as done'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <AccordionContent>
                      <Separator className="mb-4" />
                      <div className="px-6 pb-4">
                        <h4 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Answer:</h4>
                        <p className="leading-relaxed mb-4 text-foreground">{q.answer}</p>
                        <div className="flex flex-wrap gap-2">
                          {q.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
