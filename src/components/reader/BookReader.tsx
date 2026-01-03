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
    default: {
      // Defensive fallback for unexpected file types (shouldn't happen with proper DB constraints)
      const fileType = book.file_type as string;
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
              <PixelIcon name="alert" size={24} className="text-[var(--text-secondary)]" />
            </div>
            <p className="font-ui fs-p-lg uppercase tracking-wide mb-1">
              Unsupported Format
            </p>
            <p className="font-mono fs-p-sm text-[var(--text-secondary)]">
              {fileType?.toUpperCase() || 'UNKNOWN'}
            </p>
          </div>
        </div>
      );
    }
  }
}
