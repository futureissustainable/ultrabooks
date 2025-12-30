'use client';

import { useEffect, use } from 'react';
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
  const { currentBook, fetchBook, isLoadingBook, error } = useBookStore();

  // Fetch book when id changes or when currentBook doesn't match
  useEffect(() => {
    if (id && (!currentBook || currentBook.id !== id)) {
      fetchBook(id);
    }
  }, [id, currentBook, fetchBook]);

  // Clean up when leaving the page - use store directly to avoid dependency issues
  useEffect(() => {
    return () => {
      useBookStore.getState().clearCurrentBook();
    };
  }, []);

  useEffect(() => {
    if (error && !isLoadingBook) {
      router.push('/library');
    }
  }, [error, isLoadingBook, router]);

  if (isLoadingBook || !currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4 p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <Spinner size="lg" />
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide">
            Loading book...
          </p>
        </div>
      </div>
    );
  }

  return <BookReader book={currentBook} />;
}
