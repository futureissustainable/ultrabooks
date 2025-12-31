'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const navItems = [
    { href: '/library', label: 'Library', icon: 'library' as const },
    { href: '/clubs', label: 'Clubs', icon: 'users' as const },
    { href: '/settings', label: 'Settings', icon: 'settings' as const },
  ];

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
              Ultrabooks
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'px-4 py-2 font-ui fs-p-sm uppercase tracking-[0.05em] transition-all duration-100 border-b-2',
                  pathname === item.href
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-100 border border-transparent hover:border-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              <PixelIcon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-100"
              >
                Sign Out
              </button>
            ) : (
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
            )}
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
          {user ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </>
  );
}
