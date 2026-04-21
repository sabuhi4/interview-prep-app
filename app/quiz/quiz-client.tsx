'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizQuestion } from '@/lib/types';
import { fetchQuizQuestionsByFilters, getDifficultyLevels } from '@/lib/api/questions';
import { saveQuizResultAction } from '@/app/actions/progress';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy, Loader2, Timer } from 'lucide-react';

const QUESTION_COUNT_OPTIONS = ['5', '10', '20', 'All'] as const;
const TIMER_OPTIONS = ['None', '15s', '30s', '60s'] as const;

function parseTimerSeconds(val: string): number | null {
  if (val === 'None') return null;
  return parseInt(val);
}

interface QuizClientProps {
  initialCategories: string[];
}

export default function QuizClient({ initialCategories }: QuizClientProps) {
  const [categories] = useState<string[]>(initialCategories);
  const [difficulties] = useState<string[]>(getDifficultyLevels());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState<string>('10');
  const [timerOption, setTimerOption] = useState<string>('None');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number; correct: boolean }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError(null);
      try {
        const questions = await fetchQuizQuestionsByFilters(selectedCategory, selectedDifficulty);
        setFilteredQuestions(questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleNextQuestion = useCallback((qs: QuizQuestion[], idx: number) => {
    clearTimer();
    if (idx < qs.length - 1) {
      setCurrentQuestionIndex(idx + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  }, [clearTimer]);

  useEffect(() => {
    if (!quizStarted || showExplanation || quizCompleted || timeLeft === null) return;

    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleNextQuestion(activeQuestions, currentQuestionIndex);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [quizStarted, currentQuestionIndex, showExplanation, quizCompleted, timeLeft, activeQuestions, handleNextQuestion, clearTimer]);

  const startQuiz = () => {
    const count = questionCount === 'All' ? filteredQuestions.length : parseInt(questionCount);
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, count);
    const timerSecs = parseTimerSeconds(timerOption);
    setActiveQuestions(shuffled);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(timerSecs);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    clearTimer();

    const currentQuestion = activeQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selectedAnswer, correct: isCorrect },
    ]);
    setShowExplanation(true);
  };

  const advanceQuestion = () => {
    handleNextQuestion(activeQuestions, currentQuestionIndex);
    const timerSecs = parseTimerSeconds(timerOption);
    if (timerSecs !== null) setTimeLeft(timerSecs);
  };

  const resetQuiz = () => {
    clearTimer();
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setActiveQuestions([]);
    setTimeLeft(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const score = answers.filter((a) => a.correct).length;
  const totalQuestions = activeQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!quizCompleted || totalQuestions === 0) return;
    saveQuizResultAction({ score, totalQuestions, percentage, category: selectedCategory, difficulty: selectedDifficulty });
  }, [quizCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!loading && filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">No quiz questions available for the selected filters.</p>
              <Button onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); }} className="mt-4">Reset Filters</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quiz Setup</CardTitle>
              <CardDescription>Customize your quiz by selecting category and difficulty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="w-full justify-start flex-wrap h-auto">
                    {categories.map((cat) => <TabsTrigger key={cat} value={cat} className="flex-none">{cat}</TabsTrigger>)}
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <TabsList className="w-full justify-start flex-wrap h-auto">
                    {difficulties.map((diff) => <TabsTrigger key={diff} value={diff} className="flex-none capitalize">{diff}</TabsTrigger>)}
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_COUNT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt === 'All' ? 'All' : `${opt} questions`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timer per Question</label>
                  <Select value={timerOption} onValueChange={setTimerOption}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMER_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading questions...</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {questionCount === 'All' ? filteredQuestions.length : Math.min(parseInt(questionCount), filteredQuestions.length)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Questions in this quiz</p>
                  </div>
                  <Button onClick={startQuiz} disabled={filteredQuestions.length === 0} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" size="lg">
                    Start Quiz
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">Quiz Completed!</CardTitle>
              <CardDescription>Here are your results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{percentage}%</div>
                <p className="text-slate-600 dark:text-slate-400">{score} out of {totalQuestions} correct</p>
              </div>
              <Progress value={percentage} className="h-3" />
              <div className="space-y-2">
                {activeQuestions.map((q) => {
                  const answer = answers.find((a) => a.questionId === q.id);
                  return (
                    <Card key={q.id} className={answer?.correct ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          {answer?.correct ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{q.question}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {answer?.correct ? 'Correct' : `Correct answer: ${q.options[q.correctAnswer]}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button onClick={resetQuiz} variant="outline" className="flex-1"><RotateCcw className="w-4 h-4 mr-2" />New Quiz</Button>
                <Link href="/" className="flex-1"><Button className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const isCorrect = currentAnswer?.correct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <span className={`flex items-center gap-1 font-mono font-semibold ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                  <Timer className="w-4 h-4" />
                  {timeLeft}s
                </span>
              )}
              <span className="font-medium">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
          {timeLeft !== null && (
            <Progress value={(timeLeft / parseTimerSeconds(timerOption)!) * 100} className="h-1 mt-1 [&>div]:bg-orange-500" />
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-2 mb-3">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
            </div>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => handleAnswerSelect(parseInt(value))} disabled={showExplanation}>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrect = showExplanation && isCorrectAnswer;
                  const showIncorrect = showExplanation && isSelected && !isCorrectAnswer;
                  return (
                    <label key={index} className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${showCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : showIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-950' : isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            {showExplanation && (
              <Card className={isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                    <div>
                      <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={resetQuiz} variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Restart</Button>
              {!showExplanation ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">Submit Answer</Button>
              ) : (
                <Button onClick={advanceQuestion} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
