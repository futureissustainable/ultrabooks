'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBookStore } from '@/lib/stores/book-store';
import { BookCard } from './BookCard';
import { BookUpload } from './BookUpload';
import { BookRow } from './BookRow';
import { ShareCollectionModal } from './ShareCollectionModal';
import { Button, Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { classicBooks } from '@/lib/classics-data';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';

export function LibraryGrid() {
  const { books, fetchBooks, isLoading, hasFetched, error, uploadBook, uploadBooks, isUploading, uploadProgress, fetchQuota } = useBookStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'all'>('home');

  // Selection mode - only available in "all" view
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchBooks();
      fetchQuota();
    }
  }, [fetchBooks, fetchQuota, hasFetched]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: latest opened first (updated_at), then latest added (created_at)
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const aOpened = new Date(a.updated_at).getTime();
    const bOpened = new Date(b.updated_at).getTime();
    if (bOpened !== aOpened) return bOpened - aOpened;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleToggleSelect = useCallback((book: Book) => {
    setSelectedBooks(prev => {
      const next = new Set(prev);
      if (next.has(book.id)) {
        next.delete(book.id);
      } else {
        next.add(book.id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBooks.size === filteredBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(filteredBooks.map(b => b.id)));
    }
  }, [filteredBooks, selectedBooks.size]);

  const handleExitSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedBooks(new Set());
  }, []);

  const getSelectedBooksData = useCallback(() => {
    return books.filter(b => selectedBooks.has(b.id));
  }, [books, selectedBooks]);

  const validateFile = (file: File): boolean => {
    const acceptedTypes = ['.epub', '.pdf', '.mobi'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setDragError(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
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

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => validateFile(file));

    if (validFiles.length === 0) return;

    if (validFiles.length === 1) {
      const result = await uploadBook(validFiles[0]);
      if (result.error) {
        setDragError(result.error);
        setTimeout(() => setDragError(null), 5000);
      }
    } else {
      const result = await uploadBooks(validFiles);
      if (result.failed.length > 0) {
        setDragError(`${result.successful.length} uploaded, ${result.failed.length} failed`);
        setTimeout(() => setDragError(null), 5000);
      }
    }
  }, [uploadBook, uploadBooks]);

  const handleViewAll = useCallback(() => {
    setViewMode('all');
    handleExitSelection();
  }, [handleExitSelection]);

  const handleBackToHome = useCallback(() => {
    setViewMode('home');
    handleExitSelection();
  }, [handleExitSelection]);

  if (isLoading && !hasFetched) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
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
      {/* Upload Progress */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] min-w-[200px]">
          <div className="flex items-center gap-3 mb-2">
            <Spinner size="sm" />
            <span className="font-ui fs-p-sm">
              {uploadProgress
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                : 'Uploading...'}
            </span>
          </div>
          {uploadProgress && (
            <div className="h-1 bg-[var(--bg-tertiary)]">
              <div
                className="h-full bg-[var(--text-primary)] transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Toast */}
      {dragError && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--text-primary)]">
          <p className="font-ui fs-p-sm">{dragError}</p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-6">
          <p className="font-ui fs-p-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {books.length === 0 ? (
        <>
          <div className="text-center py-16 md:py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-8">
            <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
              <PixelIcon name="library" size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="font-display fs-h-lg uppercase mb-3">No Books Yet</h2>
            <p className="font-ui fs-p-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto px-4">
              Upload your first EPUB, PDF, or MOBI file
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <PixelIcon name="upload" size={12} className="mr-2" />
              Upload Book
            </Button>
          </div>

          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
          />
        </>
      ) : viewMode === 'home' ? (
        // Home view - Netflix style rows
        <div className="space-y-10">
          <BookRow
            title="Latest Books"
            books={sortedBooks}
            onViewAll={handleViewAll}
          />

          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
          />
        </div>
      ) : (
        // All books view - Grid with selection
        <>
          {/* Toolbar for All view */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <PixelIcon name="chevron-left" size={14} />
              <span className="font-ui fs-p-sm">Back</span>
            </button>

            <div className="flex-1 max-w-md relative">
              <PixelIcon
                name="search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 font-ui fs-p-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none border border-[var(--border-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              {isSelectionMode ? (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {selectedBooks.size === filteredBooks.length ? 'None' : 'All'}
                  </button>
                  <span className="font-mono fs-p-sm text-[var(--text-tertiary)]">
                    {selectedBooks.size}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    disabled={selectedBooks.size === 0}
                  >
                    Share
                  </Button>
                  <button
                    onClick={handleExitSelection}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <PixelIcon name="close" size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsSelectionMode(true)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Select books"
                  >
                    <PixelIcon name="check" size={14} />
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Upload book"
                  >
                    <PixelIcon name="upload" size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search results message */}
          {searchQuery && (
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)] mb-4">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'}
            </p>
          )}

          {/* Grid */}
          {filteredBooks.length === 0 && searchQuery ? (
            <div className="text-center py-16 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <p className="font-ui fs-p-sm text-[var(--text-secondary)]">No results</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedBooks.has(book.id)}
                  onSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}
        </>
      )}

      <BookUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      <ShareCollectionModal
        books={getSelectedBooksData()}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          handleExitSelection();
        }}
      />
    </div>
  );
}
