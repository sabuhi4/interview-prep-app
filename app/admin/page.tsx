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
  Lock, Pencil, Search, X, Save, BookOpen, Trash2,
} from 'lucide-react';
import {
  createQuestionAction, createQuizQuestionAction,
  updateQuestionAction, fetchAllQuestionsForAdminAction,
  fetchStoriesForAdminAction, createStoryAction, updateStoryAction, deleteStoryAction,
} from './actions';
import { logoutAction } from '@/lib/auth';
import { Question, QuestionTrack, QuizQuestion, Story, StoryTrack } from '@/lib/types';
import { useRouter } from 'next/navigation';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const TEXTAREA_CLASS = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-sm';

export default function AdminPage() {
  const router = useRouter();
  const [mainView, setMainView] = useState<'add' | 'manage' | 'stories'>('add');
  const [activeTab, setActiveTab] = useState('qa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [qaForm, setQaForm] = useState({
    track: 'frontend' as QuestionTrack,
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

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [manageSearch, setManageSearch] = useState('');
  const [manageTrack, setManageTrack] = useState<'All' | 'frontend' | 'business-analyst' | 'both'>('All');
  const [manageCategory, setManageCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    track: 'frontend' as QuestionTrack,
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question: '',
    answer: '',
    tags: '',
    admin_only: false,
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoaded, setStoriesLoaded] = useState(false);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storyEditingId, setStoryEditingId] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({
    title: '',
    body: '',
    themes: '',
    track: 'both' as StoryTrack,
    display_order: 0,
    prompt: '',
  });
  const [storyEditForm, setStoryEditForm] = useState({
    title: '',
    body: '',
    themes: '',
    track: 'both' as StoryTrack,
    display_order: 0,
    prompt: '',
  });

  const resetStoryForm = () => setStoryForm({ title: '', body: '', themes: '', track: 'both', display_order: 0, prompt: '' });

  const loadStories = useCallback(async () => {
    setStoriesLoading(true);
    try {
      const result = await fetchStoriesForAdminAction();
      if (!result.success) {
        setMessage({ type: 'error', text: `Failed to load stories: ${result.error}` });
      }
      setStories(result.data as Story[]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to load stories: ${msg}` });
    } finally {
      setStoriesLoading(false);
      setStoriesLoaded(true);
    }
  }, []);

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await createStoryAction({
        title: storyForm.title.trim(),
        body: storyForm.body.trim(),
        themes: storyForm.themes.split(',').map((t) => t.trim()).filter(Boolean),
        track: storyForm.track,
        display_order: storyForm.display_order,
        prompt: storyForm.prompt.trim() || undefined,
      });
      if (!result.success) {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Story added!' });
        resetStoryForm();
        setStoriesLoaded(false);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Unexpected error: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const startStoryEdit = (s: Story) => {
    setStoryEditingId(s.id);
    setStoryEditForm({
      title: s.title,
      body: s.body,
      themes: s.themes.join(', '),
      track: s.track,
      display_order: s.display_order,
      prompt: s.prompt ?? '',
    });
  };

  const handleStoryEditSave = async () => {
    if (!storyEditingId) return;
    setLoading(true);
    setMessage(null);
    const updated = {
      title: storyEditForm.title.trim(),
      body: storyEditForm.body.trim(),
      themes: storyEditForm.themes.split(',').map((t) => t.trim()).filter(Boolean),
      track: storyEditForm.track,
      display_order: storyEditForm.display_order,
      prompt: storyEditForm.prompt.trim() || undefined,
    };
    const result = await updateStoryAction(storyEditingId, updated);
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Story updated!' });
      setStories((prev) => prev.map((s) => s.id === storyEditingId ? { ...s, ...updated } : s));
      setStoryEditingId(null);
    } else {
      setMessage({ type: 'error', text: `Error: ${result.error}` });
    }
  };

  const handleStoryDelete = async (id: string) => {
    if (!confirm('Delete this story?')) return;
    setLoading(true);
    setMessage(null);
    const result = await deleteStoryAction(id);
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Story deleted.' });
      setStories((prev) => prev.filter((s) => s.id !== id));
    } else {
      setMessage({ type: 'error', text: `Error: ${result.error}` });
    }
  };

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const result = await fetchAllQuestionsForAdminAction();
      if (!result.success) {
        setMessage({ type: 'error', text: `Failed to load questions: ${result.error}` });
      }
      setAllQuestions(result.data as Question[]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to load questions: ${msg}` });
    } finally {
      setQuestionsLoading(false);
      setQuestionsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mainView === 'manage' && !questionsLoaded) {
      loadQuestions();
    }
  }, [mainView, questionsLoaded, loadQuestions]);

  useEffect(() => {
    if (mainView === 'stories' && !storiesLoaded) {
      loadStories();
    }
  }, [mainView, storiesLoaded, loadStories]);

  const trackFilteredQuestions = manageTrack === 'All' ? allQuestions : allQuestions.filter(q => q.track === manageTrack);
  const manageCategories = ['All', ...Array.from(new Set(trackFilteredQuestions.map((q) => q.category))).sort()];

  const filteredManageQuestions = trackFilteredQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(manageSearch.toLowerCase()) ||
      q.answer.toLowerCase().includes(manageSearch.toLowerCase());
    const matchesCategory = manageCategory === 'All' || q.category === manageCategory;
    return matchesSearch && matchesCategory;
  });

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({
      track: q.track,
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
      track: editForm.track,
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

  const resetQaForm = () => setQaForm({ track: 'frontend', category: '', difficulty: 'medium', question: '', answer: '', tags: '' });
  const resetQuizForm = () => setQuizForm({ category: '', difficulty: 'medium', question: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: 0, explanation: '', tags: '' });

  const handleQaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const questionData: Omit<Question, 'id'> = {
        track: qaForm.track,
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
    window.location.href = '/admin/login';
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
          <Button
            variant={mainView === 'stories' ? 'default' : 'outline'}
            onClick={() => setMainView('stories')}
            className={mainView === 'stories' ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" />Stories
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
                <TabsList className="w-full justify-start flex-wrap h-auto mb-6">
                  <TabsTrigger value="qa" className="flex-none">Q&A Question</TabsTrigger>
                  <TabsTrigger value="quiz" className="flex-none">Quiz Question</TabsTrigger>
                </TabsList>

                <TabsContent value="qa">
                  <form onSubmit={handleQaSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Track *</label>
                      <Tabs value={qaForm.track} onValueChange={(v) => setQaForm({ ...qaForm, track: v as 'frontend' | 'business-analyst' })}>
                        <TabsList className="w-full justify-start flex-wrap h-auto">
                          <TabsTrigger value="frontend" className="flex-none">Frontend Engineer</TabsTrigger>
                          <TabsTrigger value="business-analyst" className="flex-none">Business Analyst</TabsTrigger>
                          <TabsTrigger value="both" className="flex-none">Both</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Input
                        placeholder={qaForm.track === 'frontend' ? 'e.g., React, JavaScript, TypeScript' : 'e.g., Business Analysis, Requirements'}
                        value={qaForm.category}
                        onChange={(e) => setQaForm({ ...qaForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                      <Tabs value={qaForm.difficulty} onValueChange={(v) => setQaForm({ ...qaForm, difficulty: v as 'easy' | 'medium' | 'hard' })}>
                        <TabsList className="w-full justify-start flex-wrap h-auto">
                          <TabsTrigger value="easy" className="flex-none">Easy</TabsTrigger>
                          <TabsTrigger value="medium" className="flex-none">Medium</TabsTrigger>
                          <TabsTrigger value="hard" className="flex-none">Hard</TabsTrigger>
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
                        <TabsList className="w-full justify-start flex-wrap h-auto">
                          <TabsTrigger value="easy" className="flex-none">Easy</TabsTrigger>
                          <TabsTrigger value="medium" className="flex-none">Medium</TabsTrigger>
                          <TabsTrigger value="hard" className="flex-none">Hard</TabsTrigger>
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

              </Tabs>
            </CardContent>
          </Card>
        )}

        {mainView === 'stories' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Story</CardTitle>
                <CardDescription>Add a new STAR story to your listen library</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title *</label>
                      <Input placeholder="e.g., Leading the dashboard redesign" value={storyForm.title} onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Display Order</label>
                      <Input type="number" value={storyForm.display_order} onChange={(e) => setStoryForm({ ...storyForm, display_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Track *</label>
                    <select
                      value={storyForm.track}
                      onChange={(e) => setStoryForm({ ...storyForm, track: e.target.value as StoryTrack })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="both">Both tracks</option>
                      <option value="po-ba">PO / BA</option>
                      <option value="frontend">Frontend</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Story Body *</label>
                    <textarea className={`${TEXTAREA_CLASS} min-h-[180px]`} placeholder="Full STAR story text..." value={storyForm.body} onChange={(e) => setStoryForm({ ...storyForm, body: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Themes (comma-separated)</label>
                    <Input placeholder="e.g., leadership, conflict, ownership" value={storyForm.themes} onChange={(e) => setStoryForm({ ...storyForm, themes: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Interview Question (optional)</label>
                    <Input placeholder="e.g., Tell me about a time you led a project" value={storyForm.prompt} onChange={(e) => setStoryForm({ ...storyForm, prompt: e.target.value })} />
                    <p className="text-xs text-slate-500 mt-1">The behavioral question this story answers</p>
                  </div>
                  <Separator />
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : <><Plus className="w-4 h-4 mr-2" />Add Story</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stories</CardTitle>
                <CardDescription>
                  {storiesLoading ? 'Loading...' : `${stories.length} stories`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : stories.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No stories yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stories.map((s) => (
                      <div key={s.id}>
                        <div className="flex items-start gap-3 py-3 group">
                          <span className="text-xs text-slate-400 w-6 flex-shrink-0 pt-1 text-right">{s.display_order}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              <Badge variant="outline" className="text-xs">{s.track}</Badge>
                              {s.themes.map((t) => (
                                <Badge key={t} className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">{t}</Badge>
                              ))}
                            </div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{s.body}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => storyEditingId === s.id ? setStoryEditingId(null) : startStoryEdit(s)}>
                              {storyEditingId === s.id ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:text-red-700" onClick={() => handleStoryDelete(s.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {storyEditingId === s.id && (
                          <div className="pb-4 pl-9 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium mb-1 block text-slate-500">Title</label>
                                <Input value={storyEditForm.title} onChange={(e) => setStoryEditForm({ ...storyEditForm, title: e.target.value })} className="h-8 text-sm" />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block text-slate-500">Display Order</label>
                                <Input type="number" value={storyEditForm.display_order} onChange={(e) => setStoryEditForm({ ...storyEditForm, display_order: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Track</label>
                              <select
                                value={storyEditForm.track}
                                onChange={(e) => setStoryEditForm({ ...storyEditForm, track: e.target.value as StoryTrack })}
                                className="w-full h-8 px-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="both">Both tracks</option>
                                <option value="po-ba">PO / BA</option>
                                <option value="frontend">Frontend</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Body</label>
                              <textarea className={`${TEXTAREA_CLASS} min-h-[120px]`} value={storyEditForm.body} onChange={(e) => setStoryEditForm({ ...storyEditForm, body: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Themes (comma-separated)</label>
                              <Input value={storyEditForm.themes} onChange={(e) => setStoryEditForm({ ...storyEditForm, themes: e.target.value })} className="h-8 text-sm" />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-slate-500">Interview Question (optional)</label>
                              <Input value={storyEditForm.prompt} onChange={(e) => setStoryEditForm({ ...storyEditForm, prompt: e.target.value })} className="h-8 text-sm" placeholder="e.g., Tell me about a time you led a project" />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={handleStoryEditSave} disabled={loading} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setStoryEditingId(null)} disabled={loading}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                      value={manageTrack}
                      onChange={(e) => {
                        setManageTrack(e.target.value as 'All' | 'frontend' | 'business-analyst' | 'both');
                        setManageCategory('All');
                      }}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="All">All Tracks</option>
                      <option value="frontend">Frontend</option>
                      <option value="business-analyst">Business Analyst</option>
                      <option value="both">Both</option>
                    </select>
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium mb-1 block text-slate-500">Track</label>
                                <select
                                  value={editForm.track}
                                  onChange={(e) => setEditForm({ ...editForm, track: e.target.value as QuestionTrack })}
                                  className="w-full h-8 px-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="frontend">Frontend</option>
                                  <option value="business-analyst">Business Analyst</option>
                                  <option value="both">Both</option>
                                </select>
                              </div>
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
