'use client';

import { useEffect, useState } from 'react';
import { useBookStore } from '@/lib/stores/book-store';
import { BookCard } from './BookCard';
import { BookUpload } from './BookUpload';
import { Button, Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function LibraryGrid() {
  const { books, fetchBooks, isLoading, error } = useBookStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && books.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-6">
          <Spinner size="lg" />
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            Loading library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar - OS Style */}
      <div className="flex flex-col sm:flex-row gap-1 mb-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex-1 relative border-r border-[var(--border-primary)] sm:border-r">
          <PixelIcon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            placeholder="SEARCH BOOKS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all duration-[50ms] border-0"
          />
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="border-0 px-6">
          <PixelIcon name="upload" size={12} className="mr-2" />
          Upload
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-8">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 ? (
        <div className="text-center py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
            <PixelIcon name="library" size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] fs-h-lg uppercase mb-3">No Books</h2>
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
            Upload your first EPUB, PDF, or MOBI file to get started
          </p>
          <Button onClick={() => setIsUploadOpen(true)}>
            <PixelIcon name="upload" size={12} className="mr-2" />
            Upload First Book
          </Button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
            <PixelIcon name="search" size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] fs-h-sm uppercase mb-3">No Results</h2>
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            No books match your search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-[var(--bg-primary)]">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <BookUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
