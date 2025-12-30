'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/lib/supabase/types';
import { PixelIcon } from '@/components/icons/PixelIcon';

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
  onBookClick?: (book: Book) => void;
  onClassicClick?: (book: ClassicBook) => void;
  onViewAll?: () => void;
  emptyMessage?: string;
}

export function BookRow({
  title,
  subtitle,
  books,
  classicBooks,
  onBookClick,
  onClassicClick,
  onViewAll,
  emptyMessage = 'No books yet',
}: BookRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [books, classicBooks]);

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl md:text-2xl uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* View All Button */}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
            >
              View All
              <PixelIcon name="arrow-right" size={12} />
            </button>
          )}

          {/* Scroll Buttons */}
          {hasBooks && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="w-9 h-9 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-primary)]"
                aria-label="Scroll left"
              >
                <PixelIcon name="chevron-left" size={14} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="w-9 h-9 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-primary)]"
                aria-label="Scroll right"
              >
                <PixelIcon name="chevron-right" size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Books Row */}
      {hasBooks ? (
        <div
          ref={scrollRef}
          className="book-row"
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
    <div className="h-full flex flex-col transition-transform duration-200 group-hover:scale-[1.02]">
      {/* Cover */}
      <div className="aspect-[2/3] bg-[var(--bg-tertiary)] relative overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-200">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="180px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book" size={24} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] px-2 py-0.5 border border-[var(--border-primary)]">
              {book.file_type}
            </span>
          </div>
        )}

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <h3
          className="font-[family-name:var(--font-ui)] text-sm font-medium truncate leading-tight"
          title={book.title}
        >
          {book.title}
        </h3>
        {book.author && (
          <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--text-secondary)] truncate mt-0.5">
            {book.author}
          </p>
        )}
      </div>
    </div>
  );
}

function ClassicBookCover({ book }: { book: ClassicBook }) {
  return (
    <div className="h-full flex flex-col transition-transform duration-200 group-hover:scale-[1.02]">
      {/* Cover */}
      <div className="aspect-[2/3] bg-[var(--bg-tertiary)] relative overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-200">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="180px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book-open" size={24} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
              Classic
            </span>
          </div>
        )}

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <h3
          className="font-[family-name:var(--font-ui)] text-sm font-medium truncate leading-tight"
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--text-secondary)] truncate mt-0.5">
          {book.author}
        </p>
      </div>
    </div>
  );
}
