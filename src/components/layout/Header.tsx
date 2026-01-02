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

  // Logged-in header - clean and balanced
  if (user && variant === 'app') {
    return (
      <>
        <header className="bg-[var(--bg-primary)] sticky top-0 z-50">
          <div className="container-page flex items-center justify-between h-16">
            {/* Left - Logo/Brand */}
            <Link
              href="/library"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center group-hover:scale-105 transition-transform">
                <PixelIcon name="book" size={18} className="text-[var(--bg-primary)]" />
              </div>
              <span className="font-display text-xl tracking-tight uppercase hidden sm:inline">
                MEMOROS
              </span>
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center gap-1">
              {/* Continue Reading - show recent book if available */}
              {recentBook && (
                <Link
                  href={`/reader/${recentBook.id}`}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  <span className="text-sm">Continue</span>
                  <PixelIcon name="arrow-right" size={14} />
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                aria-label="Toggle theme"
              >
                <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                aria-label="Menu"
              >
                <PixelIcon name="menu" size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Menu Overlay */}
        <div
          className={clsx('mobile-menu-overlay', mobileMenuOpen && 'open')}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel - Clean & Minimal */}
        <div className={clsx('mobile-menu', mobileMenuOpen && 'open')}>
          <div className="mobile-menu-header">
            <span className="text-lg font-medium text-[var(--text-primary)]">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              aria-label="Close menu"
            >
              <PixelIcon name="close" size={18} />
            </button>
          </div>

          <nav className="mobile-menu-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'mobile-menu-item',
                  pathname === item.href && 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                )}
              >
                <span className="flex items-center gap-4">
                  <PixelIcon name={item.icon} size={20} />
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="my-4" />

            <button
              onClick={toggleTheme}
              className="mobile-menu-item text-left w-full"
            >
              <span className="flex items-center gap-4">
                <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <div className="flex-1" />

            <button
              onClick={handleSignOut}
              className="mobile-menu-item text-left w-full mt-auto text-[var(--text-tertiary)]"
            >
              <span className="flex items-center gap-4">
                <PixelIcon name="log-out" size={20} />
                Sign Out
              </span>
            </button>
          </nav>
        </div>
      </>
    );
  }

  // Logged-out header - clean style
  return (
    <>
      <header className="bg-[var(--bg-primary)] sticky top-0 z-50">
        <div className="container-page flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center group-hover:scale-105 transition-transform">
              <PixelIcon name="book" size={18} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-display text-xl tracking-tight uppercase hidden sm:inline">
              MEMOROS
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              aria-label="Toggle theme"
            >
              <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
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
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
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

      {/* Mobile Menu - Clean */}
      <div className={clsx('mobile-menu', mobileMenuOpen && 'open')}>
        <div className="mobile-menu-header">
          <span className="text-lg font-medium text-[var(--text-primary)]">
            Menu
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            aria-label="Close menu"
          >
            <PixelIcon name="close" size={18} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <button
            onClick={toggleTheme}
            className="mobile-menu-item text-left w-full"
          >
            <span className="flex items-center gap-4">
              <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <div className="my-4" />

          <Link href="/login" className="mobile-menu-item">
            <span className="flex items-center gap-4">
              <PixelIcon name="log-in" size={20} />
              Login
            </span>
          </Link>
          <Link href="/signup" className="mobile-menu-item">
            <span className="flex items-center gap-4">
              <PixelIcon name="user-plus" size={20} />
              Sign Up
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
}
