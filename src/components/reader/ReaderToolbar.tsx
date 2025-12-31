'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { useReaderStore } from '@/lib/stores/reader-store';
import { useStreakStore } from '@/lib/stores/streak-store';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface ReaderToolbarProps {
  title: string;
  currentPage?: number;
  totalPages?: number;
  progress: number;
  onBookmark: () => void;
  isBookmarked: boolean;
}

export function ReaderToolbar({
  title,
  currentPage,
  totalPages,
  progress,
  onBookmark,
  isBookmarked,
}: ReaderToolbarProps) {
  const {
    setTocOpen,
    setSettingsOpen,
    setBookmarksOpen,
    setHighlightsOpen,
  } = useReaderStore();

  const {
    currentStreak,
    todayProgress,
    setStreakModalOpen,
  } = useStreakStore();

  const isGoalMet = todayProgress.goalMet;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left - Back and TOC */}
        <div className="flex items-center gap-2">
          <Link
            href="/library"
            className="flex items-center gap-2 px-3 py-1.5 fs-p-lg text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
          >
            <PixelIcon name="chevron-left" size={14} />
            <span className="font-ui fs-p-sm uppercase tracking-wide hidden sm:inline">
              Library
            </span>
          </Link>
          <button
            onClick={() => setTocOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 fs-p-lg text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
            aria-label="Table of contents"
          >
            <PixelIcon name="menu" size={14} />
            <span className="font-ui fs-p-sm uppercase tracking-wide hidden sm:inline">
              Contents
            </span>
          </button>
        </div>

        {/* Center - Title and Progress */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="font-display fs-p-lg uppercase tracking-tight truncate max-w-[300px]">
            {title}
          </span>
          <span className="font-mono fs-p-sm text-[var(--text-tertiary)]">
            {currentPage !== undefined && totalPages !== undefined && (
              <>{currentPage}/{totalPages} &middot; </>
            )}
            {Math.round(progress)}%
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          {/* Streak Button */}
          <button
            onClick={() => setStreakModalOpen(true)}
            className={clsx(
              'flex items-center gap-1.5 px-2 py-1.5 transition-colors border border-[var(--border-primary)]',
              isGoalMet
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            )}
            aria-label="View streak"
          >
            <PixelIcon name="fire" size={14} />
            <span className="font-mono fs-p-sm tabular-nums">
              {currentStreak}
            </span>
          </button>
          <button
            onClick={onBookmark}
            className={clsx(
              'p-2 transition-colors border border-[var(--border-primary)]',
              isBookmarked
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            )}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <PixelIcon name={isBookmarked ? 'bookmark-filled' : 'bookmark'} size={14} />
          </button>
          <button
            onClick={() => setBookmarksOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
            aria-label="View bookmarks"
          >
            <PixelIcon name="book-open" size={14} />
          </button>
          <button
            onClick={() => setHighlightsOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
            aria-label="View highlights"
          >
            <PixelIcon name="highlight" size={14} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-primary)]"
            aria-label="Reader settings"
          >
            <PixelIcon name="settings" size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[2px] bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--text-primary)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
