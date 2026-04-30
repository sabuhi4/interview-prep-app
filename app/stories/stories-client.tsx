'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Story, StoryTrack } from '@/lib/types';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, BookOpen, Loader2 } from 'lucide-react';

const TRACK_LABELS: Record<StoryTrack | 'all', string> = {
  all: 'All Stories',
  'po-ba': 'BA / PO',
  frontend: 'Frontend',
  both: 'Both Tracks',
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const PAUSE_AFTER_TITLE = 2000;
const PAUSE_AFTER_BODY = 3000;

type PendingAudio = { gen: number; url: string };

interface StoriesClientProps {
  stories: Story[];
}

export default function StoriesClient({ stories }: StoriesClientProps) {
  const [selectedTrack, setSelectedTrack] = useState<StoryTrack | 'all'>('all');
  const [speed, setSpeed] = useState(1);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStories, setSessionStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'title' | 'body'>('title');
  const [generating, setGenerating] = useState(false);

  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const phaseRef = useRef<'title' | 'body'>('title');
  const sessionStoriesRef = useRef<Story[]>([]);
  const speedRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prefetchAbortRef = useRef<AbortController | null>(null);
  const pendingAudioRef = useRef<PendingAudio | null>(null);
  const awaitingGenRef = useRef<number | null>(null);
  const prefetchFailedGenRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const speakRef = useRef<() => void>(() => {});
  const prefetchRef = useRef<(gen: number) => void>(() => {});
  const playUrlRef = useRef<(gen: number, url: string) => void>(() => {});

  const filteredStories = selectedTrack === 'all'
    ? stories
    : stories.filter(s => s.track === selectedTrack || s.track === 'both');

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try { await wakeLockRef.current.release(); } catch {}
      wakeLockRef.current = null;
    }
  };

  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  };

  const stopAll = useCallback(() => {
    generationRef.current++;
    clearTimer();
    abortRef.current?.abort();
    prefetchAbortRef.current?.abort();
    pendingAudioRef.current = null;
    awaitingGenRef.current = null;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setGenerating(false);
    releaseWakeLock();
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => { stopAll(); };
  }, [stopAll]);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const generateAudio = useCallback(async (text: string, signal: AbortSignal): Promise<string> => {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok) throw new Error('TTS failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }, []);

  useEffect(() => {
    playUrlRef.current = (gen: number, url: string) => {
      if (gen !== generationRef.current) { URL.revokeObjectURL(url); return; }
      const audio = audioRef.current!;
      audio.onended = null;
      audio.onpause = null;
      audio.src = url;
      audio.playbackRate = speedRef.current;
      setGenerating(false);

      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (gen !== generationRef.current) return;
        const currentPhase = phaseRef.current;
        const pause = currentPhase === 'title' ? PAUSE_AFTER_TITLE : PAUSE_AFTER_BODY;
        timerRef.current = setTimeout(() => {
          if (gen !== generationRef.current) return;
          if (currentPhase === 'title') {
            phaseRef.current = 'body';
            setPhase('body');
            speakRef.current();
          } else {
            const next = currentIndexRef.current + 1;
            if (next >= sessionStoriesRef.current.length) {
              isPlayingRef.current = false;
              setIsPlaying(false);
              releaseWakeLock();
              return;
            }
            currentIndexRef.current = next;
            setCurrentIndex(next);
            phaseRef.current = 'title';
            setPhase('title');
            speakRef.current();
          }
        }, pause);
      };

      audio.play()
        .then(() => {
          audio.onpause = () => {
            if (gen !== generationRef.current || !isPlayingRef.current || audio.ended) return;
            timerRef.current = setTimeout(() => {
              if (gen !== generationRef.current || !isPlayingRef.current || audio.ended) return;
              audio.play().catch(() => {});
            }, 300);
          };
        })
        .catch(() => {
          if (gen !== generationRef.current) return;
          isPlayingRef.current = false;
          setIsPlaying(false);
        });
    };
  });

  useEffect(() => {
    prefetchRef.current = (gen: number) => {
      const idx = currentIndexRef.current;
      const ph = phaseRef.current;
      const list = sessionStoriesRef.current;
      const nextText = ph === 'title' ? list[idx]?.body : list[idx + 1]?.title;
      if (!nextText) return;

      prefetchAbortRef.current?.abort();
      const controller = new AbortController();
      prefetchAbortRef.current = controller;

      generateAudio(nextText, controller.signal)
        .then(url => {
          if (gen !== generationRef.current) { URL.revokeObjectURL(url); return; }
          pendingAudioRef.current = { gen, url };
          if (awaitingGenRef.current === gen) {
            awaitingGenRef.current = null;
            playUrlRef.current(gen, url);
          }
        })
        .catch(() => {
          if (gen === generationRef.current) prefetchFailedGenRef.current = gen;
        });
    };
  });

  useEffect(() => {
    speakRef.current = () => {
      const gen = generationRef.current;
      const idx = currentIndexRef.current;
      const ph = phaseRef.current;
      const story = sessionStoriesRef.current[idx];
      if (!story) return;

      const text = ph === 'title' ? story.title : story.body;
      setGenerating(true);

      if (pendingAudioRef.current?.gen === gen) {
        const { url } = pendingAudioRef.current;
        pendingAudioRef.current = null;
        playUrlRef.current(gen, url);
        prefetchRef.current(gen);
        return;
      }

      prefetchAbortRef.current?.abort();
      pendingAudioRef.current = null;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      generateAudio(text, controller.signal)
        .then(url => {
          if (gen !== generationRef.current) { URL.revokeObjectURL(url); return; }
          playUrlRef.current(gen, url);
          prefetchRef.current(gen);
        })
        .catch(() => {
          if (gen !== generationRef.current || !isPlayingRef.current) return;
          setTimeout(() => {
            if (gen !== generationRef.current || !isPlayingRef.current) return;
            speakRef.current();
          }, 1500);
        });
    };
  });

  const startFrom = (list: Story[], idx: number) => {
    stopAll();
    const gen = generationRef.current + 1;
    generationRef.current = gen;
    sessionStoriesRef.current = list;
    currentIndexRef.current = idx;
    phaseRef.current = 'title';
    isPlayingRef.current = true;
    setSessionStories(list);
    setCurrentIndex(idx);
    setPhase('title');
    setIsPlaying(true);
    setSessionActive(true);
    acquireWakeLock();
    setTimeout(() => speakRef.current(), 0);
  };

  const togglePlay = () => {
    if (!sessionActive) return;
    if (isPlayingRef.current) {
      generationRef.current++;
      clearTimer();
      abortRef.current?.abort();
      prefetchAbortRef.current?.abort();
      pendingAudioRef.current = null;
      audioRef.current?.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
      releaseWakeLock();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      acquireWakeLock();
      speakRef.current();
    }
  };

  const jumpTo = (idx: number) => {
    if (!sessionActive || idx < 0 || idx >= sessionStories.length) return;
    startFrom(sessionStoriesRef.current, idx);
  };

  useEffect(() => {
    if (!sessionActive || !('mediaSession' in navigator)) return;
    const story = sessionStories[currentIndex];
    if (!story) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: story.title,
      artist: phase === 'title' ? 'Story title' : 'Story narrative',
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => jumpTo(currentIndex - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => jumpTo(currentIndex + 1));
  });

  const progress = sessionActive && sessionStories.length
    ? ((currentIndex + (phase === 'body' ? 0.5 : 0)) / sessionStories.length) * 100
    : 0;

  // ─── Setup screen ────────────────────────────────────────────────────────────
  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />Admin Panel
              </Button>
            </Link>
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Story Bank
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Listen and memorize your interview stories</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-sm font-medium mb-3">Track</p>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'po-ba', 'frontend', 'both'] as const).map(t => (
                    <Button
                      key={t}
                      size="sm"
                      variant={selectedTrack === t ? 'default' : 'outline'}
                      onClick={() => setSelectedTrack(t)}
                      className={selectedTrack === t ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : ''}
                    >
                      {TRACK_LABELS[t]}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Speed</p>
                <div className="flex gap-2">
                  {SPEEDS.map(s => (
                    <Button key={s} size="sm" variant={speed === s ? 'default' : 'outline'} onClick={() => setSpeed(s)}>
                      {s}×
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{filteredStories.length} stories</p>
                <Button
                  onClick={() => startFrom(filteredStories, 0)}
                  disabled={!filteredStories.length}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 gap-2"
                >
                  <Play className="w-4 h-4" />Play All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {filteredStories.map((story, i) => (
              <Card
                key={story.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => startFrom(filteredStories, i)}
              >
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{story.title}</p>
                    {story.prompt && (
                      <p className="text-xs text-slate-400 truncate mt-0.5 italic">{story.prompt}</p>
                    )}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{story.track}</Badge>
                      {story.themes.slice(0, 3).map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </CardContent>
              </Card>
            ))}

            {!filteredStories.length && (
              <p className="text-center text-slate-400 py-12 text-sm">No stories yet. Add them from the Admin Panel.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Session screen ───────────────────────────────────────────────────────────
  const story = sessionStories[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { stopAll(); setSessionActive(false); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <span className="text-sm text-slate-500">{currentIndex + 1} / {sessionStories.length}</span>
        </div>

        <Progress value={progress} className="mb-6 h-1.5" />

        {story && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="outline">{story.track}</Badge>
                {story.themes.slice(0, 4).map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
                {generating && <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />}
              </div>

              {story.prompt && (
                <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                  <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Interview Question</p>
                  <p className="text-sm text-purple-800 dark:text-purple-200">{story.prompt}</p>
                </div>
              )}

              <div className={`mb-5 transition-opacity duration-300 ${phase === 'title' ? 'opacity-100' : 'opacity-40'}`}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Story</p>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{story.title}</h2>
              </div>

              <Separator className="my-4" />

              <div className={`transition-opacity duration-300 ${phase === 'body' ? 'opacity-100' : 'opacity-20'}`}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Narrative</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{story.body}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => jumpTo(currentIndex - 1)} disabled={currentIndex === 0}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => jumpTo(currentIndex + 1)} disabled={currentIndex === sessionStories.length - 1}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {SPEEDS.map(s => (
            <Button
              key={s}
              size="sm"
              variant={speed === s ? 'default' : 'ghost'}
              onClick={() => {
                setSpeed(s);
                speedRef.current = s;
                if (audioRef.current) audioRef.current.playbackRate = s;
              }}
            >
              {s}×
            </Button>
          ))}
        </div>

        <div className="space-y-1">
          {sessionStories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => jumpTo(i)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                i === currentIndex
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xs text-slate-400 mr-2">{i + 1}.</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
