'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Question, QuestionTrack } from '@/lib/types';
import FlashCard from '@/components/flashcard';
import { ArrowLeft, ArrowRight, RotateCcw, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const TRACK_LABELS: Record<QuestionTrack, string> = {
  'frontend': 'Frontend Engineer',
  'business-analyst': 'Business Analyst',
  'both': 'Both',
};

interface FlashcardsClientProps {
  initialQuestions: Question[];
}

export default function FlashcardsClient({ initialQuestions }: FlashcardsClientProps) {
  const [questions] = useState<Question[]>(initialQuestions);
  const [selectedTrack, setSelectedTrack] = useState<QuestionTrack>('frontend');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const trackCategories = ['All', ...Array.from(
    new Set(questions.filter(q => q.track === selectedTrack || q.track === 'both').map(q => q.category))
  ).sort()];

  const handleTrackChange = (track: string) => {
    setSelectedTrack(track as QuestionTrack);
    setSelectedCategory('All');
  };
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCards, setSessionCards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredQuestions = questions.filter((q) => {
    const matchesTrack = q.track === selectedTrack || q.track === 'both';
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesTrack && matchesCategory;
  });

  const startSession = () => {
    const shuffled = shuffle(filteredQuestions);
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionActive(true);
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, sessionCards.length - 1)), 150);
  }, [sessionCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150);
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setIsFlipped((f) => !f); }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sessionActive, handleNext, handlePrev]);

  if (sessionActive && sessionCards.length > 0) {
    const card = sessionCards[currentIndex];
    const progress = Math.round(((currentIndex + 1) / sessionCards.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setSessionActive(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />Exit Session
            </Button>
            <span className="text-sm text-slate-500 dark:text-slate-400">{currentIndex + 1} / {sessionCards.length}</span>
            <Button variant="ghost" size="icon" onClick={() => { setCurrentIndex(0); setIsFlipped(false); setSessionCards(shuffle(filteredQuestions)); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          <FlashCard question={card} isFlipped={isFlipped} onClick={() => setIsFlipped((f) => !f)} />

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" />Prev
            </Button>
            <Button variant="outline" onClick={() => setIsFlipped((f) => !f)} className="gap-2">
              <RotateCcw className="w-4 h-4" />Flip (Space)
            </Button>
            <Button variant="outline" onClick={handleNext} disabled={currentIndex === sessionCards.length - 1}>
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            ← → to navigate · Space to flip
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Flashcards
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Review key concepts with interactive flip cards</p>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Track</label>
            <Tabs value={selectedTrack} onValueChange={handleTrackChange}>
              <TabsList className="w-full justify-start flex-wrap h-auto">
                {(Object.keys(TRACK_LABELS) as QuestionTrack[]).map((t) => (
                  <TabsTrigger key={t} value={t} className="flex-none">{TRACK_LABELS[t]}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start flex-wrap h-auto">
                {trackCategories.map((cat) => <TabsTrigger key={cat} value={cat} className="flex-none">{cat}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>

          <Button
            onClick={startSession}
            disabled={filteredQuestions.length === 0}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shrink-0 gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Start Studying ({filteredQuestions.length} cards)
          </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="group">
              <Card className="h-48 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="h-full flex flex-col p-5">
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{q.category}</Badge>
                    <Badge className={`text-xs ${q.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-relaxed line-clamp-4 flex-1">{q.question}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />Start session to study
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
