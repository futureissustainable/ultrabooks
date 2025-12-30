'use client';

import { useEffect } from 'react';
import { clsx } from 'clsx';
import { useStreakStore } from '@/lib/stores/streak-store';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface StreakDisplayProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function StreakDisplay({ variant = 'compact', className }: StreakDisplayProps) {
  const {
    goal,
    currentStreak,
    todayProgress,
    checkAndUpdateStreak,
    setStreakModalOpen,
    setGoalModalOpen,
  } = useStreakStore();

  // Check streak on mount (in case user missed days)
  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const progress = goal.type === 'pages'
    ? todayProgress.pagesRead
    : todayProgress.minutesRead;

  const progressPercent = Math.min((progress / goal.target) * 100, 100);
  const isGoalMet = todayProgress.goalMet;

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setStreakModalOpen(true)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 border border-[var(--border-primary)]',
          'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors',
          'group',
          className
        )}
      >
        <div className={clsx(
          'relative flex items-center justify-center',
          isGoalMet && 'animate-pulse'
        )}>
          <PixelIcon
            name="fire"
            size={16}
            className={clsx(
              isGoalMet ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]',
              'group-hover:text-[var(--bg-primary)]'
            )}
          />
        </div>
        <span className="font-[family-name:var(--font-mono)] fs-p-lg tabular-nums">
          {currentStreak}
        </span>
      </button>
    );
  }

  return (
    <div className={clsx('border border-[var(--border-primary)] bg-[var(--bg-primary)]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-10 h-10 flex items-center justify-center border border-[var(--border-primary)]',
            isGoalMet ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)]'
          )}>
            <PixelIcon name="fire" size={20} />
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] fs-h-lg uppercase tracking-tight">
              {currentStreak}
            </p>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              Day Streak
            </p>
          </div>
        </div>
        <button
          onClick={() => setGoalModalOpen(true)}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
          aria-label="Edit goal"
        >
          <PixelIcon name="settings" size={14} />
        </button>
      </div>

      {/* Today's Progress */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            Today&apos;s Goal
          </p>
          <p className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-tertiary)]">
            {progress} / {goal.target} {goal.type === 'pages' ? 'pages' : 'min'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] overflow-hidden">
          <div
            className={clsx(
              'absolute inset-y-0 left-0 transition-all duration-500',
              isGoalMet ? 'bg-[var(--text-primary)]' : 'bg-[var(--gray-400)]'
            )}
            style={{ width: `${progressPercent}%` }}
          />
          {/* Grid lines for brutalist effect */}
          <div className="absolute inset-0 flex">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-[var(--border-primary)] last:border-r-0" />
            ))}
          </div>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={clsx(
              'font-[family-name:var(--font-mono)] fs-p-sm uppercase tracking-wide',
              progressPercent > 50 ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
            )}>
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Status message */}
        <p className={clsx(
          'mt-3 font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-center',
          isGoalMet ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
        )}>
          {isGoalMet
            ? '[ Goal Complete - Streak Extended ]'
            : `[ ${goal.target - progress} ${goal.type === 'pages' ? 'pages' : 'min'} to go ]`
          }
        </p>
      </div>
    </div>
  );
}
