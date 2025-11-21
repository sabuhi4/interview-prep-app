'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizQuestion } from '@/lib/types';
import { fetchQuizQuestionsByFilters, fetchCategories, getDifficultyLevels } from '@/lib/api/questions';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [difficulties] = useState<string[]>(getDifficultyLevels());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number; correct: boolean }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    }
    loadCategories();
  }, []);

  // Fetch filtered questions when category or difficulty changes
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const questions = await fetchQuizQuestionsByFilters(selectedCategory, selectedDifficulty);
        setFilteredQuestions(questions);
      } catch (error) {
        console.error('Error loading quiz questions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        correct: isCorrect,
      },
    ]);

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
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
  const totalQuestions = filteredQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No quiz questions available for the selected filters.
              </p>
              <Button onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); }} className="mt-4">
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Setup
              </CardTitle>
              <CardDescription>
                Customize your quiz by selecting category and difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="w-full justify-start flex-wrap h-auto">
                    {categories.map((cat) => (
                      <TabsTrigger key={cat} value={cat}>
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <TabsList className="w-full justify-start">
                    {difficulties.map((diff) => (
                      <TabsTrigger key={diff} value={diff} className="capitalize">
                        {diff}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <Separator />

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Loading questions...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {filteredQuestions.length}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Questions available
                    </p>
                  </div>

                  <Button
                    onClick={startQuiz}
                    disabled={filteredQuestions.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    size="lg"
                  >
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
                <div className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {percentage}%
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {score} out of {totalQuestions} correct
                </p>
              </div>

              <Progress value={percentage} className="h-3" />

              <div className="space-y-2">
                {filteredQuestions.map((q) => {
                  const answer = answers.find((a) => a.questionId === q.id);
                  return (
                    <Card key={q.id} className={answer?.correct ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          {answer?.correct ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
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
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Quiz
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);
  const isCorrect = currentAnswer?.correct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="font-medium">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex gap-2 mb-3">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options */}
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              disabled={showExplanation}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrect = showExplanation && isCorrectAnswer;
                  const showIncorrect = showExplanation && isSelected && !isCorrectAnswer;

                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : showIncorrect
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            {/* Explanation */}
            {showExplanation && (
              <Card className={isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold mb-1">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
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