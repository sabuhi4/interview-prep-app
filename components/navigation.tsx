import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code2, Settings } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Frontend Prep
            </span>
          </Link>
          <div className="flex gap-2 items-center">
            <Link href="/questions">
              <Button variant="ghost">Questions</Button>
            </Link>
            <Link href="/quiz">
              <Button variant="ghost">Quiz</Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="icon" title="Admin Panel">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}