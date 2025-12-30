'use client';

import { useEffect, useState } from 'react';
import type { Book } from '@/lib/supabase/types';
import { EpubReader } from './EpubReader';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { Button } from '@/components/ui';
import Link from 'next/link';

interface MobiReaderProps {
  book: Book;
}

export function MobiReader({ book }: MobiReaderProps) {
  const [isConverting, setIsConverting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convertedBook, setConvertedBook] = useState<Book | null>(null);

  useEffect(() => {
    // MOBI format is complex and requires server-side conversion
    // For now, we'll show a message that MOBI support is limited
    // In a production app, you would:
    // 1. Send the MOBI file to a server endpoint
    // 2. Use a library like KindleUnpack to convert to EPUB
    // 3. Return the EPUB for rendering

    const convertMobi = async () => {
      try {
        // Simulate checking if we can read the file
        // In reality, MOBI files would need server-side conversion
        setIsConverting(false);
        setError(
          'MOBI format requires conversion. Please convert your MOBI file to EPUB using a tool like Calibre, then re-upload.'
        );
      } catch {
        setIsConverting(false);
        setError('Failed to process MOBI file.');
      }
    };

    convertMobi();
  }, [book]);

  if (isConverting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <PixelIcon name="loading" size={32} />
          </div>
          <p className="font-ui fs-p-lg uppercase tracking-wide animate-pulse-brutal">
            Processing MOBI file...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 max-w-md">
          <PixelIcon name="file-mobi" size={64} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
          <h2 className="font-display fs-h-sm mb-4">MOBI Format Notice</h2>
          <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">
              Recommended: Use{' '}
              <a
                href="https://calibre-ebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)]"
              >
                Calibre
              </a>
              {' '}to convert MOBI to EPUB
            </p>
            <Link href="/library">
              <Button variant="secondary">Back to Library</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If conversion succeeded (future implementation), render as EPUB
  if (convertedBook) {
    return <EpubReader book={convertedBook} />;
  }

  return null;
}
