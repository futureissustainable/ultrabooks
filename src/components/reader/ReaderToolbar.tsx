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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[var(--bg-titlebar)] border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <Link href="/library">
            <button className="w-3 h-3 border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors" />
          </Link>
          <div className="w-3 h-3 border border-[var(--border-primary)]" />
          <div className="w-3 h-3 border border-[var(--border-primary)]" />
        </div>
        <span className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)] truncate max-w-[200px] sm:max-w-none">
          {title}
        </span>
        <div className="w-[52px]" /> {/* Spacer for balance */}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[var(--bg-secondary)]">
        {/* Left Section - Navigation */}
        <div className="flex items-center border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <Link href="/library">
            <button className="flex items-center gap-1 px-2 py-1 border-r border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors">
              <PixelIcon name="chevron-left" size={12} />
              <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.02em] hidden sm:inline">
                Library
              </span>
            </button>
          </Link>
          <button
            onClick={() => setTocOpen(true)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
            aria-label="Table of contents"
          >
            <PixelIcon name="menu" size={12} />
            <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.02em] hidden sm:inline">
              Contents
            </span>
          </button>
        </div>

        {/* Center - Progress */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1 border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          {currentPage !== undefined && totalPages !== undefined && (
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-secondary)]">
              {currentPage}/{totalPages}
            </span>
          )}
          <span className="font-[family-name:var(--font-mono)] text-[10px]">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <button
            onClick={onBookmark}
            className={`flex items-center gap-1 px-2 py-1 border-r border-[var(--border-primary)] transition-colors ${
              isBookmarked
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <PixelIcon name={isBookmarked ? 'bookmark-filled' : 'bookmark'} size={12} />
          </button>
          <button
            onClick={() => setBookmarksOpen(true)}
            className="flex items-center gap-1 px-2 py-1 border-r border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
            aria-label="View bookmarks"
          >
            <PixelIcon name="book-open" size={12} />
          </button>
          <button
            onClick={() => setHighlightsOpen(true)}
            className="flex items-center gap-1 px-2 py-1 border-r border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
            aria-label="View highlights"
          >
            <PixelIcon name="highlight" size={12} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
            aria-label="Reader settings"
          >
            <PixelIcon name="settings" size={12} />
          </button>
        </div>
      </div>

      {/* Progress Bar - Brutalist style */}
      <div className="h-[2px] bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-[var(--text-primary)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
