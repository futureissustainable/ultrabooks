'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { useReaderStore } from '@/lib/stores/reader-store';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface ReaderToolbarProps {
  title: string;
  progress: number;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  hideBookmark?: boolean;
}

export function ReaderToolbar({
  title,
  progress,
  onBookmark,
  isBookmarked,
  hideBookmark,
}: ReaderToolbarProps) {
  const {
    setSettingsOpen,
    setHighlightsOpen,
  } = useReaderStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14">
        {/* Left - Back */}
        <Link
          href="/library"
          className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          aria-label="Back to library"
        >
          <PixelIcon name="chevron-left" size={20} />
        </Link>

        {/* Center - Title (minimal) */}
        <span className="text-sm text-[var(--text-tertiary)] truncate max-w-[200px] hidden sm:block">
          {title}
        </span>

        {/* Right - Actions */}
        <div className="flex items-center">
          {!hideBookmark && onBookmark && (
            <button
              onClick={onBookmark}
              className={clsx(
                'w-11 h-11 flex items-center justify-center rounded-[5px] transition-all',
                isBookmarked
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              )}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <PixelIcon name={isBookmarked ? 'bookmark-filled' : 'bookmark'} size={18} />
            </button>
          )}
          <button
            onClick={() => setHighlightsOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            aria-label="View highlights"
          >
            <PixelIcon name="highlight" size={18} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            aria-label="Settings"
          >
            <PixelIcon name="settings" size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar - subtle */}
      <div className="h-0.5 bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--text-primary)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
