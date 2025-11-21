'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Code2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [stats, setStats] = useState({
    questionsCount: 0,
    quizQuestionsCount: 0,
    categoriesCount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch counts from Supabase
        const [questionsResult, quizResult, categoriesResult] = await Promise.all([
          supabase.from('questions').select('id', { count: 'exact', head: true }),
          supabase.from('quiz_questions').select('id', { count: 'exact', head: true }),
          supabase.from('questions').select('category'),
        ]);

        const uniqueCategories = new Set(categoriesResult.data?.map(q => q.category) || []);

        setStats({
          questionsCount: questionsResult.count || 0,
          quizQuestionsCount: quizResult.count || 0,
          categoriesCount: uniqueCategories.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Code2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Frontend Interview Prep
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Master frontend development with curated interview questions, detailed answers, and interactive quizzes
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Questions & Answers</CardTitle>
              <CardDescription className="text-base">
                Browse through comprehensive interview questions with detailed explanations covering React, Next.js, JavaScript, TypeScript, CSS, and HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/questions">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-2xl">Interactive Quizzes</CardTitle>
              <CardDescription className="text-base">
                Test your knowledge with interactive multiple-choice quizzes and get instant feedback on your answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quiz">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Take a Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.questionsCount}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {stats.quizQuestionsCount}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Quiz Questions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.categoriesCount}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Modern UI</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
