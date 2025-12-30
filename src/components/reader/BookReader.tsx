'use client';

import type { Book } from '@/lib/supabase/types';
import { EpubReader } from './EpubReader';
import { PdfReader } from './PdfReader';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface BookReaderProps {
  book: Book;
}

export function BookReader({ book }: BookReaderProps) {
  switch (book.file_type) {
    case 'epub':
    case 'mobi':
      // foliate-js handles both EPUB and MOBI natively
      return <EpubReader book={book} />;
    case 'pdf':
      return <PdfReader book={book} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
            {/* Window titlebar */}
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-titlebar)] border-b border-[var(--border-primary)]">
              <span className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Error
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 border border-[var(--border-primary)]" />
                <div className="w-2 h-2 border border-[var(--border-primary)]" />
                <div className="w-2 h-2 border border-[var(--border-primary)]" />
              </div>
            </div>
            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center">
                <PixelIcon name="alert" size={20} className="text-[var(--text-secondary)]" />
              </div>
              <div className="text-center">
                <p className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em] mb-1">
                  Unsupported Format
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-secondary)]">
                  {book.file_type?.toUpperCase() || 'UNKNOWN'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
