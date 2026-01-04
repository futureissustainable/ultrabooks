'use client';

import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

/**
 * Onboarding Checklist - Floating progress indicator
 *
 * Psychology principles:
 * - Endowed Progress Effect: Pre-checked items create momentum
 * - Zeigarnik Effect: Incomplete tasks motivate completion
 * - Goal Gradient Effect: Progress bar shows proximity to goal
 * - Variable Rewards: Each completion feels like an achievement
 */
export function OnboardingChecklist() {
  const {
    hasCompletedOnboarding,
    showOnboardingChecklist,
    milestones,
    toggleChecklist,
    getProgress,
  } = useOnboardingStore();

  // Don't show if onboarding is complete
  if (hasCompletedOnboarding) return null;

  const { completed, total, percentage } = getProgress();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showOnboardingChecklist ? (
        // Expanded checklist
        <div className="w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[5px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center justify-between">
            <div>
              <h3 className="font-ui fs-p-lg font-medium text-[var(--text-primary)]">
                Getting Started
              </h3>
              <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">
                {completed}/{total} complete
              </p>
            </div>
            <button
              onClick={toggleChecklist}
              className="w-8 h-8 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
              aria-label="Minimize"
            >
              <PixelIcon name="minimize" size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-2">
            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="px-2 pb-2">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={clsx(
                  'flex items-start gap-3 px-2 py-2.5 rounded-[5px] transition-colors',
                  milestone.completed
                    ? 'opacity-60'
                    : 'hover:bg-[var(--bg-secondary)]'
                )}
              >
                {/* Checkbox */}
                <div
                  className={clsx(
                    'w-5 h-5 rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    milestone.completed
                      ? 'bg-[var(--text-primary)]'
                      : 'border-2 border-[var(--border-primary)]'
                  )}
                >
                  {milestone.completed && (
                    <PixelIcon name="check" size={10} className="text-[var(--bg-primary)]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      'font-ui fs-p-sm leading-tight',
                      milestone.completed
                        ? 'text-[var(--text-tertiary)] line-through'
                        : 'text-[var(--text-primary)]'
                    )}
                  >
                    {milestone.label}
                  </p>
                  {!milestone.completed && (
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)] leading-tight mt-0.5">
                      {milestone.description}
                    </p>
                  )}
                </div>

                {/* Pre-completed badge */}
                {milestone.preCompleted && milestone.completed && (
                  <span className="font-ui text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Encouragement message */}
          <div className="px-4 py-3 border-t border-[var(--border-primary)] text-center">
            <p className="font-ui fs-p-sm text-[var(--text-secondary)]">
              {percentage < 50
                ? "You're off to a great start!"
                : percentage < 80
                ? 'Almost there, keep going!'
                : "Just one more step!"}
            </p>
          </div>
        </div>
      ) : (
        // Collapsed state - just progress ring
        <button
          onClick={toggleChecklist}
          className="group w-14 h-14 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={`Onboarding progress: ${percentage}%`}
        >
          {/* Circular progress */}
          <svg className="w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="3"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 126} 126`}
              className="transition-all duration-500"
            />
          </svg>

          {/* Center icon */}
          <div className="absolute">
            <PixelIcon
              name="check"
              size={16}
              className="text-[var(--text-primary)] group-hover:scale-110 transition-transform"
            />
          </div>
        </button>
      )}
    </div>
  );
}
