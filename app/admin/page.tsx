'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { createQuestionAction, createQuizQuestionAction } from './actions';
import { logoutAction } from '@/lib/auth';
import { Question, QuizQuestion } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('qa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [qaForm, setQaForm] = useState({
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question: '',
    answer: '',
    tags: '',
  });

  const [quizForm, setQuizForm] = useState({
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    explanation: '',
    tags: '',
  });

  const resetQaForm = () => {
    setQaForm({
      category: '',
      difficulty: 'medium',
      question: '',
      answer: '',
      tags: '',
    });
  };

  const resetQuizForm = () => {
    setQuizForm({
      category: '',
      difficulty: 'medium',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
      tags: '',
    });
  };

  const handleQaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const questionData: Omit<Question, 'id'> = {
        category: qaForm.category.trim(),
        difficulty: qaForm.difficulty,
        question: qaForm.question.trim(),
        answer: qaForm.answer.trim(),
        tags: qaForm.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      const result = await createQuestionAction(questionData);

      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Question added successfully!' });
        resetQaForm();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const questionData: Omit<QuizQuestion, 'id'> = {
        category: quizForm.category.trim(),
        difficulty: quizForm.difficulty,
        question: quizForm.question.trim(),
        options: [
          quizForm.option1.trim(),
          quizForm.option2.trim(),
          quizForm.option3.trim(),
          quizForm.option4.trim(),
        ],
        correctAnswer: quizForm.correctAnswer,
        explanation: quizForm.explanation.trim(),
        tags: quizForm.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      const result = await createQuizQuestionAction(questionData);

      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Quiz question added successfully!' });
        resetQuizForm();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Add new questions to the interview prep database
          </p>
        </div>

        {message && (
          <Card className={`mb-6 ${message.type === 'success' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {message.text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>Choose the question type and fill in the details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="qa">Q&A Question</TabsTrigger>
                <TabsTrigger value="quiz">Quiz Question</TabsTrigger>
              </TabsList>

              <TabsContent value="qa">
                <form onSubmit={handleQaSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Input
                      placeholder="e.g., React, JavaScript, TypeScript"
                      value={qaForm.category}
                      onChange={(e) => setQaForm({ ...qaForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                    <Tabs value={qaForm.difficulty} onValueChange={(value) => setQaForm({ ...qaForm, difficulty: value as 'easy' | 'medium' | 'hard' })}>
                      <TabsList className="w-full">
                        <TabsTrigger value="easy" className="flex-1">Easy</TabsTrigger>
                        <TabsTrigger value="medium" className="flex-1">Medium</TabsTrigger>
                        <TabsTrigger value="hard" className="flex-1">Hard</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Question *</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                      placeholder="Enter the interview question..."
                      value={qaForm.question}
                      onChange={(e) => setQaForm({ ...qaForm, question: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Answer *</label>
                    <textarea
                      className="w-full min-h-[150px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                      placeholder="Enter the detailed answer/explanation..."
                      value={qaForm.answer}
                      onChange={(e) => setQaForm({ ...qaForm, answer: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags * (comma-separated)</label>
                    <Input
                      placeholder="e.g., hooks, useState, react"
                      value={qaForm.tags}
                      onChange={(e) => setQaForm({ ...qaForm, tags: e.target.value })}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Question...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Q&A Question
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="quiz">
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Input
                      placeholder="e.g., React, JavaScript, TypeScript"
                      value={quizForm.category}
                      onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                    <Tabs value={quizForm.difficulty} onValueChange={(value) => setQuizForm({ ...quizForm, difficulty: value as 'easy' | 'medium' | 'hard' })}>
                      <TabsList className="w-full">
                        <TabsTrigger value="easy" className="flex-1">Easy</TabsTrigger>
                        <TabsTrigger value="medium" className="flex-1">Medium</TabsTrigger>
                        <TabsTrigger value="hard" className="flex-1">Hard</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Question *</label>
                    <textarea
                      className="w-full min-h-[80px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                      placeholder="Enter the quiz question..."
                      value={quizForm.question}
                      onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Answer Options * (4 required)</label>
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={quizForm.correctAnswer === num - 1}
                          onChange={() => setQuizForm({ ...quizForm, correctAnswer: num - 1 })}
                          className="w-4 h-4"
                        />
                        <Input
                          placeholder={`Option ${num}`}
                          value={quizForm[`option${num}` as keyof typeof quizForm] as string}
                          onChange={(e) => setQuizForm({ ...quizForm, [`option${num}`]: e.target.value })}
                          required
                        />
                      </div>
                    ))}
                    <p className="text-xs text-slate-500">Select the radio button for the correct answer</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Explanation *</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                      placeholder="Explain why the correct answer is right..."
                      value={quizForm.explanation}
                      onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags * (comma-separated)</label>
                    <Input
                      placeholder="e.g., hooks, useState, react"
                      value={quizForm.tags}
                      onChange={(e) => setQuizForm({ ...quizForm, tags: e.target.value })}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Question...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Quiz Question
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}