'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBookStore } from '@/lib/stores/book-store';
import { BookCard } from './BookCard';
import { BookUpload } from './BookUpload';
import { BookRow } from './BookRow';
import { Button, Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { classicBooks } from '@/lib/classics-data';
import { clsx } from 'clsx';

export function LibraryGrid() {
  const { books, fetchBooks, isLoading, hasFetched, error, uploadBook, isUploading } = useBookStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'netflix' | 'grid'>('netflix');

  useEffect(() => {
    // Only fetch if we haven't fetched yet
    if (!hasFetched && !isLoading) {
      fetchBooks();
    }
  }, [fetchBooks, hasFetched, isLoading]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get books sorted by most recently updated (currently reading)
  const currentlyReading = [...books]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);


  // Library-wide drag and drop handlers
  const validateFile = (file: File): boolean => {
    const acceptedTypes = ['.epub', '.pdf', '.mobi'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setDragError(`Invalid file type. Accepted formats: ${acceptedTypes.join(', ')}`);
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setDragError('File too large. Maximum size is 100MB.');
      return false;
    }
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      const result = await uploadBook(file);
      if (result.error) {
        setDragError(result.error);
        setTimeout(() => setDragError(null), 5000);
      }
    }
  }, [uploadBook]);

  // Show loading only if we're actively loading AND haven't fetched yet
  // This prevents infinite loading - once hasFetched is true, we show content
  if (!hasFetched && (isLoading || books.length === 0)) {
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
    <div
      className={clsx('library-drop-zone', isDragging && 'dragging')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
          <Spinner size="sm" />
          <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em]">
            Uploading...
          </span>
        </div>
      )}

      {/* Drag Error Toast */}
      {dragError && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--text-primary)]">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">
            {dragError}
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-1 mb-6 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex-1 relative border-b sm:border-b-0 sm:border-r border-[var(--border-primary)]">
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
        {/* View Toggle */}
        <div className="flex border-b sm:border-b-0 sm:border-r border-[var(--border-primary)]">
          <button
            onClick={() => setViewMode('netflix')}
            className={clsx(
              'px-4 py-3 flex items-center justify-center transition-colors',
              viewMode === 'netflix'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'hover:bg-[var(--bg-tertiary)]'
            )}
            aria-label="Row view"
          >
            <PixelIcon name="menu" size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'px-4 py-3 flex items-center justify-center transition-colors border-l border-[var(--border-primary)]',
              viewMode === 'grid'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'hover:bg-[var(--bg-tertiary)]'
            )}
            aria-label="Grid view"
          >
            <PixelIcon name="layout" size={14} />
          </button>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="border-0 px-6 justify-center">
          <PixelIcon name="upload" size={12} className="mr-2" />
          Upload
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-6">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 ? (
        <>
          <div className="text-center py-16 md:py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-8">
            <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
              <PixelIcon name="library" size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] fs-h-lg uppercase mb-3">No Books Yet</h2>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-8 max-w-sm mx-auto px-4">
              Upload your first EPUB, PDF, or MOBI file. Or browse our collection of free classics below.
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <PixelIcon name="upload" size={12} className="mr-2" />
              Upload First Book
            </Button>
          </div>

          {/* Show classics even when library is empty */}
          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
          />
        </>
      ) : searchQuery ? (
        // Search Results
        <>
          <div className="mb-4">
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 md:py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
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
        </>
      ) : viewMode === 'netflix' ? (
        // Netflix-style row view
        <div className="space-y-10">
          {/* Currently Reading */}
          {currentlyReading.length > 0 && (
            <BookRow
              title="Currently Reading"
              subtitle="Continue where you left off"
              books={currentlyReading}
              onViewAll={() => setViewMode('grid')}
            />
          )}

          {/* Popular Classics */}
          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
          />
        </div>
      ) : (
        // Grid view
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              All Books ({books.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-[var(--bg-primary)]">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <BookUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
