'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClassicBookStore } from '@/lib/stores/classic-book-store';
import { ClassicBookReader } from '@/components/reader/ClassicBookReader';
import { Spinner } from '@/components/ui';

interface ClassicReaderClientProps {
  id: string;
}

export function ClassicReaderClient({ id }: ClassicReaderClientProps) {
  const router = useRouter();
  const {
    currentClassic,
    currentClassicBlob,
    getClassicById,
    fetchAndCacheClassic,
    isClassicLoading,
  } = useClassicBookStore();

  // Fetch classic book when id changes or when not loaded
  useEffect(() => {
    const loadClassic = async () => {
      const book = getClassicById(id);
      if (!book) {
        router.push('/library');
        return;
      }

      // If we don't have the current classic or it's a different book
      if (!currentClassic || currentClassic.id !== id || !currentClassicBlob) {
        await fetchAndCacheClassic(book);
      }
    };

    loadClassic();
  }, [id, currentClassic, currentClassicBlob, getClassicById, fetchAndCacheClassic, router]);

  // Clean up when leaving the page
  useEffect(() => {
    return () => {
      useClassicBookStore.getState().clearCurrentClassic();
    };
  }, []);

  // Show loading if we're fetching or don't have the book yet
  if (isClassicLoading(id) || !currentClassic || !currentClassicBlob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4 p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <Spinner size="lg" />
          <p className="font-ui fs-p-sm uppercase tracking-wide">
            Loading classic...
          </p>
        </div>
      </div>
    );
  }

  return <ClassicBookReader book={currentClassic} fileBlob={currentClassicBlob} />;
}
