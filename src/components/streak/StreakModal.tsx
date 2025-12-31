'use client';

import { clsx } from 'clsx';
import { useStreakStore } from '@/lib/stores/streak-store';
import { Modal } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function StreakModal() {
  const {
    goal,
    currentStreak,
    longestStreak,
    todayProgress,
    history,
    isStreakModalOpen,
    setStreakModalOpen,
    setGoalModalOpen,
  } = useStreakStore();

  const progress = goal.type === 'pages'
    ? todayProgress.pagesRead
    : todayProgress.minutesRead;

  const progressPercent = Math.min((progress / goal.target) * 100, 100);
  const isGoalMet = todayProgress.goalMet;

  // Get last 7 days for mini calendar
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = i === 0
        ? todayProgress
        : history.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        goalMet: dayProgress?.goalMet ?? false,
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <Modal
      isOpen={isStreakModalOpen}
      onClose={() => setStreakModalOpen(false)}
      title="Reading Streak"
      size="md"
    >
      <div className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-[1px] bg-[var(--border-primary)]">
          <div className="bg-[var(--bg-primary)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PixelIcon
                name="fire"
                size={24}
                className={isGoalMet ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}
              />
            </div>
            <p className="font-display fs-h-lg uppercase tracking-tight">
              {currentStreak}
            </p>
            <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              Current Streak
            </p>
          </div>
          <div className="bg-[var(--bg-primary)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PixelIcon name="trophy" size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="font-display fs-h-lg uppercase tracking-tight">
              {longestStreak}
            </p>
            <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              Longest Streak
            </p>
          </div>
        </div>

        {/* Weekly View */}
        <div className="border border-[var(--border-primary)] p-4">
          <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-3">
            This Week
          </p>
          <div className="grid grid-cols-7 gap-[1px] bg-[var(--border-primary)]">
            {last7Days.map((day) => (
              <div
                key={day.date}
                className={clsx(
                  'aspect-square flex flex-col items-center justify-center',
                  day.goalMet
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-secondary)]'
                )}
              >
                <span className={clsx(
                  'font-mono fs-p-sm',
                  day.isToday && !day.goalMet && 'text-[var(--text-primary)]'
                )}>
                  {day.dayName}
                </span>
                {day.goalMet && (
                  <PixelIcon name="check" size={12} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Progress */}
        <div className="border border-[var(--border-primary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Today&apos;s Progress
            </p>
            <button
              onClick={() => {
                setStreakModalOpen(false);
                setGoalModalOpen(true);
              }}
              className="font-ui fs-p-sm uppercase tracking-wide text-[var(--text-tertiary)] hover:text-[var(--text-primary)] underline"
            >
              Edit Goal
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative h-8 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] overflow-hidden mb-2">
            <div
              className={clsx(
                'absolute inset-y-0 left-0 transition-all duration-500',
                isGoalMet ? 'bg-[var(--text-primary)]' : 'bg-[var(--gray-400)]'
              )}
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={clsx(
                'font-mono fs-p-sm',
                progressPercent > 50 ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
              )}>
                {progress} / {goal.target} {goal.type === 'pages' ? 'pages' : 'min'}
              </span>
            </div>
          </div>

          <p className={clsx(
            'font-ui fs-p-sm uppercase tracking-[0.05em] text-center',
            isGoalMet ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
          )}>
            {isGoalMet
              ? '[ Goal Complete ]'
              : `[ ${goal.target - progress} ${goal.type === 'pages' ? 'pages' : 'min'} remaining ]`
            }
          </p>
        </div>

        {/* Motivation */}
        {currentStreak > 0 && (
          <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 text-center">
            <p className="font-display fs-p-lg uppercase tracking-tight">
              {currentStreak >= 30
                ? '[ Legendary Reader ]'
                : currentStreak >= 14
                  ? '[ Dedicated Reader ]'
                  : currentStreak >= 7
                    ? '[ Consistent Reader ]'
                    : currentStreak >= 3
                      ? '[ Building Momentum ]'
                      : '[ Great Start ]'
              }
            </p>
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)] mt-1">
              {currentStreak >= 30
                ? 'A month of daily reading. Incredible.'
                : currentStreak >= 14
                  ? 'Two weeks strong. Keep it up.'
                  : currentStreak >= 7
                    ? 'A full week. Reading is becoming habit.'
                    : currentStreak >= 3
                      ? 'Three days in a row. Momentum building.'
                      : 'Every streak starts with day one.'
              }
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
