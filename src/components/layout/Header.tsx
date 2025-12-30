'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { Button } from '@/components/ui';

export function Header() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
      <div className="flex items-center justify-between">
        {/* Logo - Menu Bar Style */}
        <Link
          href={user ? '/library' : '/'}
          className="flex items-center gap-3 px-4 py-3 border-r border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] group"
        >
          <div className="w-6 h-6 bg-[var(--text-primary)] group-hover:bg-[var(--bg-primary)] flex items-center justify-center transition-all duration-[50ms]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className="text-[var(--bg-primary)] group-hover:text-[var(--text-primary)]">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tight uppercase">
            Ultrabooks
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center flex-1">
          {user && (
            <div className="flex items-center">
              <Link
                href="/library"
                className="px-4 py-3 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] border-r border-[var(--border-primary)]"
              >
                Library
              </Link>
              <Link
                href="/settings"
                className="px-4 py-3 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] border-r border-[var(--border-primary)]"
              >
                Settings
              </Link>
            </div>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center">
          {user ? (
            <>
              <button
                onClick={toggleTheme}
                className="px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] border-l border-[var(--border-primary)] flex items-center gap-2"
                aria-label="Toggle theme"
              >
                <span className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] hidden sm:inline">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
                {theme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] border-l border-[var(--border-primary)] flex items-center gap-2"
                aria-label="Sign out"
              >
                <span className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] hidden sm:inline">
                  Exit
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleTheme}
                className="px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-[50ms] border-l border-[var(--border-primary)]"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              <Link href="/login" className="border-l border-[var(--border-primary)]">
                <Button variant="ghost" size="sm" className="px-4 py-3 border-0">
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="border-l border-[var(--border-primary)]">
                <Button variant="primary" size="sm" className="px-4 py-3 border-0">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
