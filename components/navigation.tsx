'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Code2, Settings, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { signOutAction } from '@/lib/user-auth';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle'), {
  ssr: false,
  loading: () => <div className="size-9 shrink-0" />,
});

const navLinks = [
  { href: '/questions', label: 'Questions' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/listen', label: 'Listen' },
  { href: '/progress', label: 'Progress' },
];

interface NavigationProps {
  user: { email: string } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base md:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Interview Prep
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={isActive ? 'bg-accent text-accent-foreground font-semibold' : ''}
                >
                  <Link href={href}>{label}</Link>
                </Button>
              );
            })}
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 px-2">
                  <User className="w-3 h-3" />
                  {user.email}
                </span>
                <form action={signOutAction}>
                  <Button variant="ghost" size="icon" title="Sign out">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="icon" title="Admin Panel">
              <Link href="/admin">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Button
                key={href}
                asChild
                variant="ghost"
                className={`w-full justify-start ${isActive ? 'bg-accent text-accent-foreground font-semibold' : ''}`}
              >
                <Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
              </Button>
            );
          })}
          {user ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                {user.email}
              </p>
              <form action={signOutAction} onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="ghost" className="w-full justify-start gap-2">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
