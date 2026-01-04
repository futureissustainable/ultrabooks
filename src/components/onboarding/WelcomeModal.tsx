'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { useBookStore } from '@/lib/stores/book-store';
import { Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

/**
 * Welcome Modal for first-time users
 *
 * Psychology principles applied:
 * - Peak-End Rule: Make the first moment memorable
 * - Reduce anxiety: Clear, simple, friendly onboarding
 * - Endowed Progress: Show them they've already started
 */
export function WelcomeModal() {
  const { hasSeenWelcome, setHasSeenWelcome, getProgress } = useOnboardingStore();
  const { books } = useBookStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Only show for brand new users with no books
  useEffect(() => {
    if (!hasSeenWelcome && books.length === 0) {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, books.length]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setHasSeenWelcome(true);
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  };

  if (!isVisible) return null;

  const { completed, total } = getProgress();

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-5',
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative z-10 w-full max-w-md',
          'bg-[var(--bg-primary)] rounded-[5px]',
          'shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
          'overflow-hidden',
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        )}
      >
        {/* Header with gradient accent */}
        <div className="relative bg-[var(--bg-tertiary)] px-8 pt-10 pb-8 text-center">
          {/* Decorative icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center">
            <PixelIcon name="book" size={36} className="text-[var(--bg-primary)]" />
          </div>

          <h1 className="font-display text-[28px] uppercase tracking-tight mb-2">
            Welcome to MEMOROS
          </h1>
          <p className="font-ui fs-p-lg text-[var(--text-secondary)]">
            Your personal ebook library awaits
          </p>
        </div>

        {/* Progress section - Endowed Progress Effect */}
        <div className="px-8 py-6 border-t border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-wider">
              Getting Started
            </span>
            <span className="font-mono fs-p-sm text-[var(--text-secondary)]">
              {completed}/{total} done
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>

          <p className="font-ui fs-p-sm text-[var(--text-secondary)] text-center">
            You&apos;re already {Math.round((completed / total) * 100)}% there!
          </p>
        </div>

        {/* Quick start options */}
        <div className="px-8 pb-8 space-y-3">
          <Button fullWidth onClick={handleClose} className="btn-shine">
            <PixelIcon name="upload" size={14} className="mr-2" />
            Upload Your First Book
          </Button>

          <button
            onClick={handleClose}
            className="w-full px-4 py-3 font-ui fs-p-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-[5px] transition-all text-center"
          >
            Browse Classic Books First
          </button>
        </div>
      </div>
    </div>
  );
}
