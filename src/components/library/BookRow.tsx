'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/lib/supabase/types';
import { PixelIcon, IconName } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

export interface ClassicBook {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  download_url: string;
  description?: string;
}

interface BookRowProps {
  title: string;
  subtitle?: string;
  books?: Book[];
  classicBooks?: ClassicBook[];
  icon?: IconName;
  onBookClick?: (book: Book) => void;
  onClassicClick?: (book: ClassicBook) => void;
  emptyMessage?: string;
}

export function BookRow({
  title,
  subtitle,
  books,
  classicBooks,
  icon,
  onBookClick,
  onClassicClick,
  emptyMessage = 'No books yet',
}: BookRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const hasBooks = (books && books.length > 0) || (classicBooks && classicBooks.length > 0);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 flex items-center justify-center border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <PixelIcon name={icon} size={14} />
            </div>
          )}
          <div>
            <h2 className="font-[family-name:var(--font-display)] fs-h-sm uppercase tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scroll Buttons */}
        {hasBooks && (
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
              aria-label="Scroll left"
            >
              <PixelIcon name="chevron-left" size={14} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
              aria-label="Scroll right"
            >
              <PixelIcon name="chevron-right" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Books Row */}
      {hasBooks ? (
        <div
          ref={scrollRef}
          className="book-row border border-[var(--border-primary)] bg-[var(--border-primary)]"
        >
          {/* User's books */}
          {books?.map((book) => (
            <div key={book.id} className="book-row-item group">
              {onBookClick ? (
                <button
                  onClick={() => onBookClick(book)}
                  className="w-full h-full text-left"
                >
                  <BookCover book={book} />
                </button>
              ) : (
                <Link href={`/reader/${book.id}`} className="block h-full">
                  <BookCover book={book} />
                </Link>
              )}
            </div>
          ))}

          {/* Classic books */}
          {classicBooks?.map((book) => (
            <div key={book.id} className="book-row-item group">
              {onClassicClick ? (
                <button
                  onClick={() => onClassicClick(book)}
                  className="w-full h-full text-left"
                >
                  <ClassicBookCover book={book} />
                </button>
              ) : (
                <a
                  href={book.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <ClassicBookCover book={book} />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 text-center">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}

function BookCover({ book }: { book: Book }) {
  return (
    <div className="bg-[var(--bg-primary)] h-full flex flex-col border-r border-[var(--border-primary)] last:border-r-0 transition-all duration-[50ms] group-hover:bg-[var(--bg-secondary)]">
      {/* Cover */}
      <div className="aspect-[3/4] bg-[var(--bg-tertiary)] relative overflow-hidden border-b border-[var(--border-primary)]">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="180px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book" size={20} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] border border-[var(--border-primary)] px-2 py-0.5">
              {book.file_type}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-[50ms] flex items-center justify-center">
          <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)]">
            Read
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3
          className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] truncate mb-1"
          title={book.title}
        >
          {book.title}
        </h3>
        {book.author && (
          <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-secondary)] truncate">
            {book.author}
          </p>
        )}
      </div>
    </div>
  );
}

function ClassicBookCover({ book }: { book: ClassicBook }) {
  return (
    <div className="bg-[var(--bg-primary)] h-full flex flex-col border-r border-[var(--border-primary)] last:border-r-0 transition-all duration-[50ms] group-hover:bg-[var(--bg-secondary)]">
      {/* Cover */}
      <div className="aspect-[3/4] bg-[var(--bg-tertiary)] relative overflow-hidden border-b border-[var(--border-primary)]">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="180px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book-open" size={20} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-tertiary)] text-center">
              EPUB
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-[50ms] flex items-center justify-center">
          <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)]">
            Download
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3
          className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] truncate mb-1"
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-secondary)] truncate">
          {book.author}
        </p>
      </div>
    </div>
  );
}
