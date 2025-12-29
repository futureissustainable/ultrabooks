'use client';

import Link from 'next/link';
import { useReaderStore } from '@/lib/stores/reader-store';
import { Button } from '@/components/ui';
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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--border-primary)]"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Link href="/library">
            <Button variant="ghost" size="sm">
              <PixelIcon name="chevron-left" size={16} />
            </Button>
          </Link>
          <button
            onClick={() => setTocOpen(true)}
            className="p-2 hover:text-[var(--color-accent)] transition-colors"
            aria-label="Table of contents"
          >
            <PixelIcon name="menu" size={20} />
          </button>
        </div>

        {/* Center - Title and Progress */}
        <div className="flex-1 text-center mx-4 hidden sm:block">
          <h1 className="font-ui text-sm truncate">{title}</h1>
          <div className="flex items-center justify-center gap-2 opacity-60">
            {currentPage !== undefined && totalPages !== undefined && (
              <span className="font-mono text-xs">
                {currentPage} / {totalPages}
              </span>
            )}
            <span className="font-mono text-xs">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <button
            onClick={onBookmark}
            className={`p-2 transition-colors ${
              isBookmarked ? 'text-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <PixelIcon name={isBookmarked ? 'bookmark-filled' : 'bookmark'} size={20} />
          </button>
          <button
            onClick={() => setBookmarksOpen(true)}
            className="p-2 hover:text-[var(--color-accent)] transition-colors"
            aria-label="View bookmarks"
          >
            <PixelIcon name="book-open" size={20} />
          </button>
          <button
            onClick={() => setHighlightsOpen(true)}
            className="p-2 hover:text-[var(--color-accent)] transition-colors"
            aria-label="View highlights"
          >
            <PixelIcon name="highlight" size={20} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:text-[var(--color-accent)] transition-colors"
            aria-label="Reader settings"
          >
            <PixelIcon name="settings" size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
