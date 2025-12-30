'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useStreakStore } from '@/lib/stores/streak-store';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function StreakCelebration() {
  const { showCelebration, dismissCelebration, currentStreak, goal } = useStreakStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      dismissCelebration();
    }, 300);
  };

  if (!isVisible) return null;

  const streakMessage = currentStreak === 1
    ? 'Streak Started!'
    : currentStreak === 7
      ? '1 Week Streak!'
      : currentStreak === 30
        ? '1 Month Streak!'
        : `${currentStreak} Day Streak!`;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'transition-opacity duration-300',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Celebration card */}
      <div
        className={clsx(
          'relative z-10 border-2 border-[var(--text-primary)] bg-[var(--bg-primary)]',
          'shadow-[8px_8px_0_var(--text-primary)]',
          'p-8 max-w-sm w-full text-center',
          'transition-transform duration-300',
          isExiting ? 'scale-95' : 'scale-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--text-primary)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--text-primary)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--text-primary)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--text-primary)]" />

        {/* Fire icon with animation */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <PixelIcon name="fire" size={48} className="text-[var(--gray-400)]" />
            </div>
            <PixelIcon name="fire" size={48} className="relative text-[var(--text-primary)]" />
          </div>
        </div>

        {/* Main message */}
        <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2">
          Goal Complete
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight mb-4">
          {streakMessage}
        </h2>

        {/* Stats */}
        <div className="border-t border-b border-[var(--border-primary)] py-3 mb-4">
          <p className="font-[family-name:var(--font-mono)] text-sm">
            {goal.target} {goal.type === 'pages' ? 'pages' : 'minutes'} read today
          </p>
        </div>

        {/* Motivational message */}
        <p className="font-[family-name:var(--font-ui)] text-[11px] text-[var(--text-secondary)]">
          {currentStreak === 1
            ? 'Every journey begins with a single step. Keep going!'
            : currentStreak < 7
              ? 'Building momentum. See you tomorrow!'
              : currentStreak < 30
                ? 'Consistency is key. You\'re doing great!'
                : 'You\'ve achieved legendary status. Incredible dedication!'
          }
        </p>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="mt-6 px-6 py-2 border border-[var(--border-primary)] font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-wide hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
        >
          Continue Reading
        </button>
      </div>
    </div>
  );
}
