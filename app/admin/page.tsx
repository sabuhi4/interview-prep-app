'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Plus, Loader2, CheckCircle2, AlertCircle, LogOut,
  Lock, Pencil, Search, X, Save,
} from 'lucide-react';
import {
  createQuestionAction, createQuizQuestionAction, createBehavioralQuestionAction,
  updateQuestionAction, fetchAllQuestionsForAdminAction,
} from './actions';
import { logoutAction } from '@/lib/auth';
import { Question, QuizQuestion } from '@/lib/types';
import { useRouter } from 'next/navigation';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const TEXTAREA_CLASS = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-sm';

export default function AdminPage() {
  const router = useRouter();
  const [mainView, setMainView] = useState<'add' | 'manage'>('add');
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

  const [behavioralForm, setBehavioralForm] = useState({
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

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [manageSearch, setManageSearch] = useState('');
  const [manageCategory, setManageCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question: '',
    answer: '',
    tags: '',
    admin_only: false,
  });

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    const result = await fetchAllQuestionsForAdminAction();
    setAllQuestions(result.data as Question[]);
    setQuestionsLoading(false);
  }, []);

  useEffect(() => {
    if (mainView === 'manage' && allQuestions.length === 0) {
      loadQuestions();
    }
  }, [mainView, allQuestions.length, loadQuestions]);

  const manageCategories = ['All', ...Array.from(new Set(allQuestions.map((q) => q.category))).sort()];

  const filteredManageQuestions = allQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(manageSearch.toLowerCase()) ||
      q.answer.toLowerCase().includes(manageSearch.toLowerCase());
    const matchesCategory = manageCategory === 'All' || q.category === manageCategory;
    return matchesSearch && matchesCategory;
  });

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      answer: q.answer,
      tags: q.tags.join(', '),
      admin_only: q.admin_only ?? false,
    });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    setLoading(true);
    setMessage(null);

    const updated = {
      category: editForm.category.trim(),
      difficulty: editForm.difficulty,
      question: editForm.question.trim(),
      answer: editForm.answer.trim(),
      tags: editForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      admin_only: editForm.admin_only,
    };

    const result = await updateQuestionAction(editingId, updated);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Question updated successfully!' });
      setAllQuestions((prev) =>
        prev.map((q) => q.id === editingId ? { ...q, ...updated } : q)
      );
      setEditingId(null);
    } else {
      setMessage({ type: 'error', text: `Error: ${result.error}` });
    }
  };

  const resetBehavioralForm = () => setBehavioralForm({ difficulty: 'medium', question: '', answer: '', tags: '' });
  const resetQaForm = () => setQaForm({ category: '', difficulty: 'medium', question: '', answer: '', tags: '' });
  const resetQuizForm = () => setQuizForm({ category: '', difficulty: 'medium', question: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: 0, explanation: '', tags: '' });

  const handleBehavioralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await createBehavioralQuestionAction({
        difficulty: behavioralForm.difficulty,
        question: behavioralForm.question.trim(),
        answer: behavioralForm.answer.trim(),
        tags: behavioralForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      });
      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Behavioral question added successfully!' });
        resetBehavioralForm();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${msg}` });
    } finally {
      setLoading(false);
    }
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
        tags: qaForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      };
      const result = await createQuestionAction(questionData);
      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Question added successfully!' });
        resetQaForm();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${msg}` });
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
        options: [quizForm.option1.trim(), quizForm.option2.trim(), quizForm.option3.trim(), quizForm.option4.trim()],
        correctAnswer: quizForm.correctAnswer,
        explanation: quizForm.explanation.trim(),
        tags: quizForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      };
      const result = await createQuizQuestionAction(questionData);
      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Quiz question added successfully!' });
        resetQuizForm();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${msg}` });
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
                <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage interview prep questions</p>
        </div>

        {message && (
          <Card className={`mb-6 ${message.type === 'success' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {message.type === 'success'
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <AlertCircle className="w-5 h-5 text-red-600" />}
                <p className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {message.text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 mb-6">
          <Button
            variant={mainView === 'add' ? 'default' : 'outline'}
            onClick={() => setMainView('add')}
            className={mainView === 'add' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' : ''}
          >
            <Plus className="w-4 h-4 mr-2" />Add Question
          </Button>
          <Button
            variant={mainView === 'manage' ? 'default' : 'outline'}
            onClick={() => setMainView('manage')}
            className={mainView === 'manage' ? 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900' : ''}
          >
            <Pencil className="w-4 h-4 mr-2" />Manage Questions
          </Button>
        </div>

        {mainView === 'add' && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Choose the question type and fill in the details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto sm:h-10">
                  <TabsTrigger value="qa">Q&A Question</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz Question</TabsTrigger>
                  <TabsTrigger value="behavioral" className="gap-1.5">
                    <Lock className="w-3 h-3" />Behavioral
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="qa">
                  <form onSubmit={handleQaSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Input placeholder="e.g., React, JavaScript, TypeScript" value={qaForm.category} onChange={(e) => setQaForm({ ...qaForm, category: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                      <Tabs value={qaForm.difficulty} onValueChange={(v) => setQaForm({ ...qaForm, difficulty: v as 'easy' | 'medium' | 'hard' })}>
                        <TabsList className="w-full">
                          <TabsTrigger value="easy" className="flex-1">Easy</TabsTrigger>
                          <TabsTrigger value="medium" className="flex-1">Medium</TabsTrigger>
                          <TabsTrigger value="hard" className="flex-1">Hard</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Question *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[100px]`} placeholder="Enter the interview question..." value={qaForm.question} onChange={(e) => setQaForm({ ...qaForm, question: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Answer *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[150px]`} placeholder="Enter the detailed answer/explanation..." value={qaForm.answer} onChange={(e) => setQaForm({ ...qaForm, answer: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags * (comma-separated)</label>
                      <Input placeholder="e.g., hooks, useState, react" value={qaForm.tags} onChange={(e) => setQaForm({ ...qaForm, tags: e.target.value })} required />
                      <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                    </div>
                    <Separator />
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding Question...</> : <><Plus className="w-4 h-4 mr-2" />Add Q&A Question</>}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="quiz">
                  <form onSubmit={handleQuizSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Input placeholder="e.g., React, JavaScript, TypeScript" value={quizForm.category} onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                      <Tabs value={quizForm.difficulty} onValueChange={(v) => setQuizForm({ ...quizForm, difficulty: v as 'easy' | 'medium' | 'hard' })}>
                        <TabsList className="w-full">
                          <TabsTrigger value="easy" className="flex-1">Easy</TabsTrigger>
                          <TabsTrigger value="medium" className="flex-1">Medium</TabsTrigger>
                          <TabsTrigger value="hard" className="flex-1">Hard</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Question *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[80px]`} placeholder="Enter the quiz question..." value={quizForm.question} onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })} required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium block">Answer Options * (4 required)</label>
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex gap-2 items-center">
                          <input type="radio" name="correctAnswer" checked={quizForm.correctAnswer === num - 1} onChange={() => setQuizForm({ ...quizForm, correctAnswer: num - 1 })} className="w-4 h-4" />
                          <Input placeholder={`Option ${num}`} value={quizForm[`option${num}` as keyof typeof quizForm] as string} onChange={(e) => setQuizForm({ ...quizForm, [`option${num}`]: e.target.value })} required />
                        </div>
                      ))}
                      <p className="text-xs text-slate-500">Select the radio button for the correct answer</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Explanation *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[100px]`} placeholder="Explain why the correct answer is right..." value={quizForm.explanation} onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags * (comma-separated)</label>
                      <Input placeholder="e.g., hooks, useState, react" value={quizForm.tags} onChange={(e) => setQuizForm({ ...quizForm, tags: e.target.value })} required />
                      <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                    </div>
                    <Separator />
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding Question...</> : <><Plus className="w-4 h-4 mr-2" />Add Quiz Question</>}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="behavioral">
                  <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Behavioral questions are only visible to authenticated admins.
                    </p>
                  </div>
                  <form onSubmit={handleBehavioralSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Input value="Behavioral" disabled className="opacity-60" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                      <Tabs value={behavioralForm.difficulty} onValueChange={(v) => setBehavioralForm({ ...behavioralForm, difficulty: v as 'easy' | 'medium' | 'hard' })}>
                        <TabsList className="w-full">
                          <TabsTrigger value="easy" className="flex-1">Easy</TabsTrigger>
                          <TabsTrigger value="medium" className="flex-1">Medium</TabsTrigger>
                          <TabsTrigger value="hard" className="flex-1">Hard</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Question *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[100px]`} placeholder="e.g., Tell me about yourself. Describe a time you handled conflict." value={behavioralForm.question} onChange={(e) => setBehavioralForm({ ...behavioralForm, question: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Guidance / Model Answer *</label>
                      <textarea className={`${TEXTAREA_CLASS} min-h-[150px]`} placeholder="How to structure the answer, key points to cover, STAR method tips..." value={behavioralForm.answer} onChange={(e) => setBehavioralForm({ ...behavioralForm, answer: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags * (comma-separated)</label>
                      <Input placeholder="e.g., communication, leadership, conflict" value={behavioralForm.tags} onChange={(e) => setBehavioralForm({ ...behavioralForm, tags: e.target.value })} required />
                      <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                    </div>
                    <Separator />
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding Question...</> : <><Plus className="w-4 h-4 mr-2" />Add Behavioral Question</>}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {mainView === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Questions</CardTitle>
              <CardDescription>
                {questionsLoading ? 'Loading...' : `${allQuestions.length} questions total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search questions..."
                        value={manageSearch}
                        onChange={(e) => setManageSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={manageCategory}
                      onChange={(e) => setManageCategory(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {manageCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Showing {filteredManageQuestions.length} of {allQuestions.length}
                  </p>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredManageQuestions.map((q, idx) => (
                      <div key={q.id}>
                        <div className="flex items-start gap-3 py-3 group">
                          <span className="text-xs text-slate-400 w-6 flex-shrink-0 pt-1 text-right">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              <Badge variant="outline" className="text-xs">{q.category}</Badge>
                              <Badge className={`text-xs ${DIFFICULTY_COLORS[q.difficulty] ?? ''}`}>{q.difficulty}</Badge>
                              {q.admin_only && (
                                <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 gap-1">
                                  <Lock className="w-2.5 h-2.5" />Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm leading-snug line-clamp-2 text-slate-700 dark:text-slate-300">{q.question}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => editingId === q.id ? setEditingId(null) : startEdit(q)}
                          >
                            {editingId === q.id ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                          </Button>
                        </div>

                        {editingId === q.id && (
                          <div className="pb-4 pl-9 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium mb-1 block text-slate-500">Category</label>
                                <Input
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block text-slate-500">Difficulty</label>
                                <select
                                  value={editForm.difficulty}
                                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                  className="w-full h-8 px-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Question</label>
                              <textarea
                                className={`${TEXTAREA_CLASS} min-h-[80px]`}
                                value={editForm.question}
                                onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Answer</label>
                              <textarea
                                className={`${TEXTAREA_CLASS} min-h-[120px]`}
                                value={editForm.answer}
                                onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Tags (comma-separated)</label>
                              <Input
                                value={editForm.tags}
                                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`admin-only-${q.id}`}
                                checked={editForm.admin_only}
                                onChange={(e) => setEditForm({ ...editForm, admin_only: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label htmlFor={`admin-only-${q.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />Admin only
                              </label>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={handleEditSave} disabled={loading} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={loading}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
