# Frontend Interview Prep App

A modern interview preparation application built with Next.js 16, TypeScript, and Supabase. Master frontend development concepts through 142 curated questions and 80 interactive quiz questions.

## Features

- Browse 142 curated interview questions across 6 categories (React, JavaScript, Next.js, TypeScript, CSS, HTML)
- Interactive quiz system with 80 multiple-choice questions
- Filter by category and difficulty (Easy, Medium, Hard)
- Search functionality across questions, answers, and tags
- Real-time feedback and detailed explanations
- Secure admin panel for content management
- Responsive design with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Authentication**: Cookie-based auth with server actions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-admin-password
```

3. Run the Supabase migration:
- Go to your Supabase Dashboard → SQL Editor
- Run the SQL file from `supabase/migrations/001_create_questions_tables.sql`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
interview-prep-app/
├── app/
│   ├── admin/              # Admin panel with authentication
│   │   ├── login/         # Admin login page
│   │   ├── actions.ts     # Server actions for admin operations
│   │   └── page.tsx       # Admin dashboard
│   ├── questions/         # Questions browser page
│   ├── quiz/              # Interactive quiz page
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Homepage with stats
│   ├── globals.css        # Global styles and theme
│   └── icon.svg           # App favicon
├── components/
│   ├── ui/                # shadcn/ui components
│   └── navigation.tsx     # Navigation header
├── lib/
│   ├── api/
│   │   ├── questions.ts   # Supabase data fetching
│   │   └── admin.ts       # Admin utilities and validation
│   ├── auth.ts            # Authentication server actions
│   ├── supabase.ts        # Supabase client setup
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
├── supabase/
│   └── migrations/        # Database schema migrations
├── proxy.ts               # Next.js 16 proxy for auth
└── package.json
```

## Database Schema

### questions table
- 142 Q&A format questions
- Fields: id, category, difficulty, question, answer, tags
- Indexed by category and difficulty for performance

### quiz_questions table
- 80 multiple-choice questions
- Fields: id, category, difficulty, question, options[], correct_answer, explanation, tags
- Indexed by category and difficulty for performance

Both tables include:
- Row Level Security (RLS) policies
- Auto-updated timestamps
- Full-text search capabilities

## Admin Panel Access

1. Navigate to `/admin`
2. You'll be redirected to the login page
3. Enter the admin password (set in `.env.local`)
4. Add new questions or quiz questions through the admin interface
5. Logout when finished

## Development

### Adding Questions via Admin Panel
- Navigate to `/admin` and login
- Choose Q&A or Quiz question tab
- Fill in all required fields
- Submit to add to database

### Building for Production
```bash
npm run build
npm start
```

## Security Features

- Cookie-based authentication with HTTP-only cookies
- Server-side password validation
- Supabase Row Level Security (RLS) policies
- Service role key kept server-side only
- CSRF protection with SameSite cookies
- Next.js 16 proxy for route protection

## License

This project is built as a portfolio showcase application.