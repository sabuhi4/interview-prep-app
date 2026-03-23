'use server';

import { createClient } from '@supabase/supabase-js';
import { Question, QuizQuestion } from '@/lib/types';
import { generateQuestionId, validateQuestion, validateQuizQuestion } from '@/lib/api/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function createQuestionAction(questionData: Omit<Question, 'id'>) {
  try {
    const validation = validateQuestion(questionData);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const id = generateQuestionId(questionData.category, 'question');

    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert([{ id, ...questionData }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function createQuizQuestionAction(questionData: Omit<QuizQuestion, 'id'>) {
  try {
    const validation = validateQuizQuestion(questionData);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const id = generateQuestionId(questionData.category, 'quiz');

    const dbQuestion = {
      id,
      category: questionData.category,
      difficulty: questionData.difficulty,
      question: questionData.question,
      options: questionData.options,
      correct_answer: questionData.correctAnswer,
      explanation: questionData.explanation,
      tags: questionData.tags,
    };

    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert([dbQuestion])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function createBehavioralQuestionAction(questionData: {
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  tags: string[];
}) {
  try {
    const validation = validateQuestion({ ...questionData, category: 'Behavioral' });
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const id = generateQuestionId('behavioral', 'question');

    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert([{
        id,
        category: 'Behavioral',
        admin_only: true,
        ...questionData,
      }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateQuestionAction(id: string, data: {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  question?: string;
  answer?: string;
  tags?: string[];
  admin_only?: boolean;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('questions')
      .update(data)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function fetchAllQuestionsForAdminAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .order('category')
      .order('difficulty');

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data ?? [] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message, data: [] };
  }
}

export async function deleteQuestionAction(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function deleteQuizQuestionAction(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}