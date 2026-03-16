'use client';

import { Badge } from '@/components/ui/badge';
import { Question } from '@/lib/types';

interface FlashCardProps {
  question: Question;
  isFlipped: boolean;
  onClick: () => void;
}

export default function FlashCard({ question, isFlipped, onClick }: FlashCardProps) {
  const difficultyColor = () => {
    switch (question.difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="card-flip-container w-full cursor-pointer select-none"
      style={{ height: '280px' }}
      onClick={onClick}
    >
      <div className={`card-flip-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-face rounded-xl border border-border bg-card shadow-sm flex flex-col p-6">
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{question.category}</Badge>
            <Badge className={difficultyColor()}>{question.difficulty}</Badge>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Question</p>
            <p className="text-lg font-semibold leading-relaxed">{question.question}</p>
          </div>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div className="card-face card-face-back rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 shadow-sm flex flex-col p-6">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm text-indigo-500 dark:text-indigo-400 mb-3 font-medium">Answer</p>
            <p className="text-base leading-relaxed overflow-y-auto">{question.answer}</p>
          </div>
          <div className="flex flex-wrap gap-1 mt-4">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
