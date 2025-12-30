'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/lib/stores/book-store';
import { BookReader } from '@/components/reader/BookReader';
import { Spinner } from '@/components/ui';

interface ReaderPageProps {
  params: Promise<{ id: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentBook, fetchBook, isLoadingBook, error, clearCurrentBook } = useBookStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id && !initialized) {
      fetchBook(id);
      setInitialized(true);
    }
  }, [id, fetchBook, initialized]);

  // Clean up when leaving the page
  useEffect(() => {
    return () => {
      clearCurrentBook();
    };
  }, [clearCurrentBook]);

  useEffect(() => {
    if (error && !isLoadingBook) {
      router.push('/library');
    }
  }, [error, isLoadingBook, router]);

  if (isLoadingBook || !currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
          {/* Window titlebar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-titlebar)] border-b border-[var(--border-primary)]">
            <span className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Loading
            </span>
            <div className="flex gap-1">
              <div className="w-2 h-2 border border-[var(--border-primary)]" />
              <div className="w-2 h-2 border border-[var(--border-primary)]" />
              <div className="w-2 h-2 border border-[var(--border-primary)]" />
            </div>
          </div>
          {/* Content */}
          <div className="p-8 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] animate-pulse">
              Loading book...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <BookReader book={currentBook} />;
}
