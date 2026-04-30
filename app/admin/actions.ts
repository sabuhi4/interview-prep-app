'use server';

import { createClient } from '@supabase/supabase-js';
import { Question, QuizQuestion, Story } from '@/lib/types';
import { generateQuestionId, validateQuestion, validateQuizQuestion } from '@/lib/api/admin';
import { isAuthenticated } from '@/lib/auth';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

async function requireAdminAuth() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    throw new Error('Unauthorized admin request');
  }
}

export async function createQuestionAction(questionData: Omit<Question, 'id'>) {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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


export async function updateQuestionAction(id: string, data: {
  track?: 'frontend' | 'business-analyst' | 'both';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  question?: string;
  answer?: string;
  tags?: string[];
  admin_only?: boolean;
}) {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
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

export async function fetchStoriesForAdminAction() {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .order('display_order');
    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data ?? [] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message, data: [] };
  }
}

export async function createStoryAction(storyData: Omit<Story, 'id'>) {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('stories')
      .insert([storyData])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateStoryAction(id: string, data: Partial<Omit<Story, 'id'>>) {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('stories')
      .update(data)
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function deleteStoryAction(id: string) {
  try {
    await requireAdminAuth();
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('stories')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
