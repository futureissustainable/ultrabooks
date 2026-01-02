'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useBookStore } from '@/lib/stores/book-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { useScrollLock } from '@/lib/hooks/use-scroll-lock';
import { getCoverUrl } from '@/lib/supabase/storage';
import { Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

interface HeaderProps {
  variant?: 'landing' | 'app';
}

export function Header({ variant = 'app' }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const { books, currentBook } = useBookStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useScrollLock(mobileMenuOpen);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push('/');
  };

  // Get the most recent book (first in the sorted list by updated_at)
  const recentBook = currentBook || (books.length > 0
    ? [...books].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0]
    : null);

  const recentBookCover = recentBook ? getCoverUrl(recentBook.cover_url) : null;

  const navItems = [
    { href: '/library', label: 'Library', icon: 'library' as const },
    { href: '/clubs', label: 'Clubs', icon: 'users' as const },
    { href: '/settings', label: 'Settings', icon: 'settings' as const },
  ];

  // Logged-in header - minimal with 3 icons (only for app variant)
  if (user && variant === 'app') {
    return (
      <>
        <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] sticky top-0 z-50">
          <div className="container-page flex items-center justify-between h-14">
            {/* Left - Current Book Cover */}
            {recentBook ? (
              <Link
                href={`/reader/${recentBook.id}`}
                className="relative -mb-4 group"
              >
                <div className="w-10 h-14 border-2 border-[var(--text-primary)] bg-[var(--bg-tertiary)] overflow-hidden shadow-md transition-transform group-hover:scale-105">
                  {recentBookCover ? (
                    <Image
                      src={recentBookCover}
                      alt={recentBook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PixelIcon name="book" size={16} className="text-[var(--text-tertiary)]" />
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="w-10" />
            )}

            {/* Center - Library */}
            <Link
              href="/library"
              className={clsx(
                'w-10 h-10 flex items-center justify-center transition-colors',
                pathname === '/library'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
              aria-label="Library"
            >
              <PixelIcon name="library" size={20} />
            </Link>

            {/* Right - Menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Menu"
            >
              <PixelIcon name="menu" size={20} />
            </button>
          </div>
        </header>

        {/* Menu Overlay */}
        <div
          className={clsx('mobile-menu-overlay', mobileMenuOpen && 'open')}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={clsx('mobile-menu', mobileMenuOpen && 'open')}>
          <div className="mobile-menu-header">
            <span className="font-display fs-h-sm tracking-tight uppercase">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close menu"
            >
              <PixelIcon name="close" size={16} />
            </button>
          </div>

          <nav className="mobile-menu-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'mobile-menu-item',
                  pathname === item.href && 'bg-[var(--bg-tertiary)]'
                )}
              >
                <span className="flex items-center gap-3">
                  <PixelIcon name={item.icon} size={16} />
                  {item.label}
                </span>
              </Link>
            ))}
            <div className="h-px bg-[var(--border-primary)] my-2" />
            <button
              onClick={toggleTheme}
              className="mobile-menu-item text-left w-full"
            >
              <span className="flex items-center gap-3">
                <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="mobile-menu-item text-left w-full"
            >
              <span className="flex items-center gap-3">
                <PixelIcon name="log-out" size={16} />
                Sign Out
              </span>
            </button>
          </nav>
        </div>
      </>
    );
  }

  // Logged-out header - original style
  return (
    <>
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] sticky top-0 z-50">
        <div className="container-page flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 bg-[var(--text-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <PixelIcon name="book" size={16} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-display fs-h-sm tracking-tight uppercase hidden sm:inline">
              MEMOROS
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-100 border border-transparent hover:border-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-100"
            aria-label="Open menu"
          >
            <PixelIcon name="menu" size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={clsx('mobile-menu-overlay', mobileMenuOpen && 'open')}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={clsx('mobile-menu', mobileMenuOpen && 'open')}>
        <div className="mobile-menu-header">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book" size={14} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-display fs-h-sm tracking-tight uppercase">
              Menu
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
            aria-label="Close menu"
          >
            <PixelIcon name="close" size={14} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <button
            onClick={toggleTheme}
            className="mobile-menu-item text-left w-full"
          >
            <span className="flex items-center gap-3">
              <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          <div className="h-px bg-[var(--border-primary)] my-2" />
          <Link href="/login" className="mobile-menu-item">
            <span className="flex items-center gap-3">
              <PixelIcon name="log-in" size={16} />
              Login
            </span>
          </Link>
          <Link href="/signup" className="mobile-menu-item">
            <span className="flex items-center gap-3">
              <PixelIcon name="user-plus" size={16} />
              Sign Up
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
}
