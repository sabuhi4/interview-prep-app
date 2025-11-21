# Supabase Database Setup

## Running Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `migrations/001_create_questions_tables.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

This will create:
- `questions` table for Q&A section
- `quiz_questions` table for quizzes
- Indexes for performance
- Row Level Security policies
- Auto-update triggers for timestamps

## Database Schema

### questions table
- `id` (TEXT, PRIMARY KEY)
- `category` (TEXT)
- `difficulty` (TEXT: 'easy', 'medium', 'hard')
- `question` (TEXT)
- `answer` (TEXT)
- `tags` (TEXT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### quiz_questions table
- `id` (TEXT, PRIMARY KEY)
- `category` (TEXT)
- `difficulty` (TEXT: 'easy', 'medium', 'hard')
- `question` (TEXT)
- `options` (TEXT[])
- `correct_answer` (INTEGER: 0-3)
- `explanation` (TEXT)
- `tags` (TEXT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Row Level Security (RLS)

- **Public users**: Can read all questions
- **Authenticated users**: Can read, insert, update, and delete questions (for admin panel)