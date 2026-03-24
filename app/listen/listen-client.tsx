'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Question } from '@/lib/types';
import { getDifficultyLevels } from '@/lib/api/questions';
import { useProgress } from '@/lib/hooks/useProgress';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw,
  Headphones, Bookmark, Shuffle, Loader2,
} from 'lucide-react';

interface ListenClientProps {
  questions: Question[];
  categories: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const PAUSE_AFTER_QUESTION = 1500;
const PAUSE_AFTER_ANSWER = 2500;

type PendingAudio = { gen: number; url: string };

export default function ListenClient({ questions, categories }: ListenClientProps) {
  const difficulties = getDifficultyLevels();
  const { bookmarkedIds } = useProgress(questions);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [shouldShuffle, setShouldShuffle] = useState(true);
  const [speed, setSpeed] = useState(1);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'question' | 'answer'>('question');
  const [generating, setGenerating] = useState(false);

  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const phaseRef = useRef<'question' | 'answer'>('question');
  const sessionQRef = useRef<Question[]>([]);
  const speedRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prefetchAbortRef = useRef<AbortController | null>(null);
  const pendingAudioRef = useRef<PendingAudio | null>(null);
  const awaitingGenRef = useRef<number | null>(null);

  const speakRef = useRef<() => void>(() => {});
  const prefetchRef = useRef<(gen: number) => void>(() => {});
  const playUrlRef = useRef<(gen: number, url: string) => void>(() => {});

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(q.id);
    return matchesCategory && matchesDifficulty && matchesBookmark;
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const cancelSpeech = useCallback((destroyElement = false) => {
    clearTimer();
    abortRef.current?.abort();
    abortRef.current = null;
    prefetchAbortRef.current?.abort();
    prefetchAbortRef.current = null;
    if (pendingAudioRef.current) {
      URL.revokeObjectURL(pendingAudioRef.current.url);
      pendingAudioRef.current = null;
    }
    awaitingGenRef.current = null;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      if (destroyElement) audioRef.current = null;
    }
  }, [clearTimer]);

  // Play a blob URL and wire up the advance logic
  const playUrl = useCallback((gen: number, url: string) => {
    if (gen !== generationRef.current || !isPlayingRef.current) {
      URL.revokeObjectURL(url);
      return;
    }

    setGenerating(false);

    // Reuse the existing unlocked audio element — creating a new Audio() from
    // an async context breaks mobile Safari's autoplay policy.
    const audio = audioRef.current!;
    audio.onended = null;
    audio.src = url;
    audio.playbackRate = speedRef.current;

    prefetchRef.current(gen);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (gen !== generationRef.current || !isPlayingRef.current) return;

      const pauseMs = phaseRef.current === 'question' ? PAUSE_AFTER_QUESTION : PAUSE_AFTER_ANSWER;

      timerRef.current = setTimeout(() => {
        if (!isPlayingRef.current || gen !== generationRef.current) return;

        if (phaseRef.current === 'question') {
          phaseRef.current = 'answer';
          setPhase('answer');
        } else {
          const next = currentIndexRef.current + 1 < sessionQRef.current.length
            ? currentIndexRef.current + 1 : 0;
          currentIndexRef.current = next;
          setCurrentIndex(next);
          phaseRef.current = 'question';
          setPhase('question');
        }

        const nextGen = gen + 1;
        generationRef.current = nextGen;

        const pending = pendingAudioRef.current;
        if (pending?.gen === nextGen) {
          pendingAudioRef.current = null;
          playUrlRef.current(nextGen, pending.url);
        } else {
          // Prefetch is still in-flight — show spinner; prefetch will call playUrl when done
          setGenerating(true);
          awaitingGenRef.current = nextGen;
        }
      }, pauseMs);
    };

    audio.play().catch(() => {});
  }, []);

  // Pre-fetch the next segment while the current one plays
  const prefetch = useCallback((currentGen: number) => {
    const idx = currentIndexRef.current;
    const ph = phaseRef.current;
    const qs = sessionQRef.current;
    if (!qs.length || !isPlayingRef.current) return;

    const nextIdx = idx + 1 < qs.length ? idx + 1 : 0;
    const nextText = ph === 'question'
      ? qs[idx].answer
      : `Question ${nextIdx + 1}. ${qs[nextIdx].question}`;
    const nextGen = currentGen + 1;

    prefetchAbortRef.current?.abort();
    const controller = new AbortController();
    prefetchAbortRef.current = controller;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: nextText }),
      signal: controller.signal,
    })
      .then((r) => r.blob())
      .then((blob) => {
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);

        if (awaitingGenRef.current === nextGen && isPlayingRef.current) {
          awaitingGenRef.current = null;
          playUrlRef.current(nextGen, url);
        } else {
          pendingAudioRef.current = { gen: nextGen, url };
        }
      })
      .catch(() => {});
  }, []);

  // Kick off generation for the current position
  const speak = useCallback(() => {
    if (!isPlayingRef.current || !sessionQRef.current.length) return;

    const q = sessionQRef.current[currentIndexRef.current];
    if (!q) return;

    cancelSpeech();

    const gen = ++generationRef.current;
    const text = phaseRef.current === 'question'
      ? `Question ${currentIndexRef.current + 1}. ${q.question}`
      : q.answer;

    setGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
      .then((r) => r.blob())
      .then((blob) => {
        if (controller.signal.aborted || gen !== generationRef.current) return;
        playUrlRef.current(gen, URL.createObjectURL(blob));
      })
      .catch(() => setGenerating(false));
  }, [cancelSpeech]);

  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { prefetchRef.current = prefetch; }, [prefetch]);
  useEffect(() => { playUrlRef.current = playUrl; }, [playUrl]);
  useEffect(() => () => cancelSpeech(true), [cancelSpeech]);

  const startSession = () => {
    cancelSpeech(true);
    // Create and unlock the audio element synchronously inside the user gesture
    // so mobile Safari allows all subsequent play() calls on this element.
    audioRef.current = new Audio();
    const qs = shouldShuffle ? shuffleArray(filteredQuestions) : [...filteredQuestions];

    sessionQRef.current = qs;
    currentIndexRef.current = 0;
    phaseRef.current = 'question';
    isPlayingRef.current = true;
    speedRef.current = speed;

    setSessionQuestions(qs);
    setCurrentIndex(0);
    setPhase('question');
    setIsPlaying(true);
    setSessionActive(true);

    setTimeout(() => speakRef.current(), 50);
  };

  const handlePlayPause = () => {
    if (isPlayingRef.current) {
      cancelSpeech();
      generationRef.current++;
      isPlayingRef.current = false;
      setIsPlaying(false);
      setGenerating(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      speakRef.current();
    }
  };

  const handleNext = () => {
    cancelSpeech();
    generationRef.current++;
    setGenerating(false);
    const next = currentIndexRef.current + 1 < sessionQRef.current.length
      ? currentIndexRef.current + 1 : 0;
    currentIndexRef.current = next;
    phaseRef.current = 'question';
    setCurrentIndex(next);
    setPhase('question');
    if (isPlayingRef.current) speakRef.current();
  };

  const handlePrev = () => {
    cancelSpeech();
    generationRef.current++;
    setGenerating(false);
    const prev = Math.max(0, currentIndexRef.current - 1);
    currentIndexRef.current = prev;
    phaseRef.current = 'question';
    setCurrentIndex(prev);
    setPhase('question');
    if (isPlayingRef.current) speakRef.current();
  };

  const handleRepeat = () => {
    cancelSpeech();
    generationRef.current++;
    setGenerating(false);
    phaseRef.current = 'question';
    setPhase('question');
    if (isPlayingRef.current) speakRef.current();
  };

  const handleExit = () => {
    cancelSpeech(true);
    generationRef.current++;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setGenerating(false);
    setSessionActive(false);
  };

  // Speed change doesn't require re-fetching — update playbackRate in place
  const handleSpeedChange = (newSpeed: number) => {
    speedRef.current = newSpeed;
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (sessionActive && sessionQuestions.length > 0) {
    const card = sessionQuestions[currentIndex];
    const progress = Math.round(((currentIndex + 1) / sessionQuestions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={handleExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />Exit
            </Button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {currentIndex + 1} / {sessionQuestions.length}
            </span>
            <div className="flex gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                    speed === s
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <Progress value={progress} className="h-1.5 mb-6" />

          <Card className="mb-6 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{card.category}</Badge>
                <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
                <Badge className={`ml-auto ${
                  phase === 'question'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                }`}>
                  {phase === 'question' ? '🎙 Question' : '💡 Answer'}
                </Badge>
              </div>

              <div className={`transition-opacity duration-300 ${phase === 'question' ? 'opacity-100' : 'opacity-50'}`}>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Question</p>
                <p className="text-base font-semibold leading-relaxed">{card.question}</p>
              </div>

              <Separator className="my-5" />

              <div className={`transition-opacity duration-300 ${phase === 'answer' ? 'opacity-100' : 'opacity-30'}`}>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Answer</p>
                <p className="text-sm leading-relaxed text-foreground">{card.answer}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="outline" size="icon" onClick={handlePrev} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              onClick={handlePlayPause} size="icon"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            >
              {generating
                ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                : isPlaying
                  ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              }
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleRepeat} className="gap-2 text-slate-500 dark:text-slate-400">
              <RotateCcw className="w-4 h-4" />
              Repeat question
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            Reads question → pauses → reads answer → auto-advances
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Listen Mode
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Hands-free Q&amp;A — great for commutes and walks
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="flex-wrap h-auto">
                    {categories.map((cat) => (
                      <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <TabsList className="w-full justify-start">
                    {difficulties.map((diff) => (
                      <TabsTrigger key={diff} value={diff} className="capitalize">{diff}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant={onlyBookmarked ? 'default' : 'outline'} size="sm"
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)} className="gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${onlyBookmarked ? 'fill-current' : ''}`} />
                  Bookmarked only
                </Button>
                <Button
                  variant={shouldShuffle ? 'default' : 'outline'} size="sm"
                  onClick={() => setShouldShuffle(!shouldShuffle)} className="gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Playback Speed</label>
                <div className="flex gap-2">
                  {SPEEDS.map((s) => (
                    <Button key={s} variant={speed === s ? 'default' : 'outline'} size="sm" onClick={() => setSpeed(s)}>
                      {s}x
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {filteredQuestions.length} questions ready
            </p>
            <Button
              onClick={startSession} disabled={filteredQuestions.length === 0} size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 gap-2 px-8"
            >
              <Headphones className="w-5 h-5" />
              Start Listening
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
