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
  const { books, fetchBooks, isLoading, hasFetched, error, uploadBook, uploadBooks, isUploading, uploadProgress, quota, fetchQuota } = useBookStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'netflix' | 'grid'>('netflix');

  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [showShareCollectionModal, setShowShareCollectionModal] = useState(false);

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
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map(b => b.id)));
    }
  }, [books, selectedBooks.size]);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedBooks(new Set());
  }, []);

  const handleShareSelected = useCallback(() => {
    if (selectedBooks.size > 0) {
      setShowShareCollectionModal(true);
    }
  }, [selectedBooks.size]);

  const getSelectedBooksData = useCallback(() => {
    return books.filter(b => selectedBooks.has(b.id));
  }, [books, selectedBooks]);

  useEffect(() => {
    // Fetch books and quota on mount if we haven't fetched yet
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

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => validateFile(file));

    if (validFiles.length === 0) {
      return;
    }

    if (validFiles.length === 1) {
      const result = await uploadBook(validFiles[0]);
      if (result.error) {
        setDragError(result.error);
        setTimeout(() => setDragError(null), 5000);
      }
    } else {
      const result = await uploadBooks(validFiles);
      if (result.failed.length > 0) {
        const message = `${result.successful.length} uploaded, ${result.failed.length} failed`;
        setDragError(message);
        setTimeout(() => setDragError(null), 5000);
      }
    }
  }, [uploadBook, uploadBooks]);

  // Show loading only during initial fetch (before hasFetched becomes true)
  // This is now bulletproof: hasFetched is set immediately when fetch starts
  if (isLoading && !hasFetched) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-6">
          <Spinner size="lg" />
          <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
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
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] min-w-[200px]">
          <div className="flex items-center gap-3 mb-2">
            <Spinner size="sm" />
            <span className="font-ui fs-p-sm uppercase tracking-[0.02em]">
              {uploadProgress
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                : 'Uploading...'}
            </span>
          </div>
          {uploadProgress && (
            <>
              <div className="h-1 bg-[var(--bg-tertiary)] mb-1">
                <div
                  className="h-full bg-[var(--text-primary)] transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
              <p className="font-mono fs-p-sm text-[var(--text-tertiary)] truncate">
                {uploadProgress.currentFile}
              </p>
            </>
          )}
        </div>
      )}

      {/* Drag Error Toast */}
      {dragError && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--text-primary)]">
          <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">
            {dragError}
          </p>
        </div>
      )}

      {/* Selection Mode Bar */}
      {isSelectionMode && (
        <div className="flex items-center justify-between gap-3 mb-4 p-3 border border-[var(--text-primary)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {selectedBooks.size === books.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="font-mono fs-p-sm text-[var(--text-tertiary)]">
              {selectedBooks.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleShareSelected}
              disabled={selectedBooks.size === 0}
            >
              <PixelIcon name="share" size={12} className="mr-2" />
              Share Selected
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExitSelectionMode}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload Quota Info */}
      {quota && (quota.daily_remaining < 20 || quota.total_remaining < 1000) && (
        <div className="flex justify-end mb-2">
          <span className="font-mono fs-p-sm text-[var(--text-tertiary)]">
            Uploads: {quota.daily_remaining}/day | {quota.total_remaining.toLocaleString()} total remaining
          </span>
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
            className="w-full pl-10 pr-4 py-3 font-ui fs-p-sm uppercase tracking-[0.02em] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all duration-100 border-0 input-focus"
          />
        </div>
        {/* View Toggle */}
        <div className="flex border-b sm:border-b-0 sm:border-r border-[var(--border-primary)]">
          <button
            onClick={() => setViewMode('netflix')}
            className={clsx(
              'px-4 py-3 flex items-center justify-center transition-all duration-100 focus-ring',
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
              'px-4 py-3 flex items-center justify-center transition-all duration-100 border-l border-[var(--border-primary)] focus-ring',
              viewMode === 'grid'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'hover:bg-[var(--bg-tertiary)]'
            )}
            aria-label="Grid view"
          >
            <PixelIcon name="layout" size={14} />
          </button>
        </div>
        {/* Select Button */}
        {books.length > 0 && !isSelectionMode && (
          <button
            onClick={() => setIsSelectionMode(true)}
            className="px-4 py-3 flex items-center justify-center gap-2 font-ui fs-p-sm uppercase tracking-[0.02em] border-b sm:border-b-0 sm:border-r border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-100 focus-ring"
          >
            <PixelIcon name="check" size={14} />
            Select
          </button>
        )}
        <Button onClick={() => setIsUploadOpen(true)} className="border-0 px-6 justify-center">
          <PixelIcon name="upload" size={12} className="mr-2" />
          Upload
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-6">
          <p className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 ? (
        <>
          <div className="text-center py-16 md:py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)] mb-8">
            <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
              <PixelIcon name="library" size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="font-display fs-h-lg uppercase mb-3">No Books Yet</h2>
            <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-8 max-w-sm mx-auto px-4">
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
            <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 md:py-24 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="w-16 h-16 mx-auto mb-6 border border-[var(--border-primary)] flex items-center justify-center">
                <PixelIcon name="search" size={32} className="text-[var(--text-tertiary)]" />
              </div>
              <h2 className="font-display fs-h-sm uppercase mb-3">No Results</h2>
              <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                No books match your search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
              {filteredBooks.map((book) => (
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
      ) : viewMode === 'netflix' ? (
        // Netflix-style row view
        <div className="space-y-10">
          {/* Your Books - show first */}
          <BookRow
            title="Your Library"
            subtitle={`${books.length} ${books.length === 1 ? 'book' : 'books'}`}
            books={filteredBooks}
            onViewAll={() => setViewMode('grid')}
          />

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
            <h2 className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              All Books ({books.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isSelectionMode={isSelectionMode}
                isSelected={selectedBooks.has(book.id)}
                onSelect={handleToggleSelect}
              />
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <BookUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Share Collection Modal */}
      <ShareCollectionModal
        books={getSelectedBooksData()}
        isOpen={showShareCollectionModal}
        onClose={() => {
          setShowShareCollectionModal(false);
          handleExitSelectionMode();
        }}
      />
    </div>
  );
}
