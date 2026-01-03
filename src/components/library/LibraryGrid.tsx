'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/lib/stores/book-store';
import { useStreakStore } from '@/lib/stores/streak-store';
import { useClassicBookStore } from '@/lib/stores/classic-book-store';
import { BookCard } from './BookCard';
import { BookUpload } from './BookUpload';
import { BookRow, type ClassicBook } from './BookRow';
import { ShareCollectionModal } from './ShareCollectionModal';
import { StreakModal, StreakGoalModal } from '@/components/streak';
import { Button, Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { classicBooks } from '@/lib/classics-data';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';

export function LibraryGrid() {
  const router = useRouter();
  const { books, fetchBooks, isLoading, hasFetched, error, uploadBook, uploadBooks, isUploading, uploadProgress, fetchQuota } = useBookStore();
  const { currentStreak, todayProgress, checkAndUpdateStreak, setStreakModalOpen } = useStreakStore();
  const { fetchAndCacheClassic, isClassicLoading } = useClassicBookStore();
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
    checkAndUpdateStreak();
  }, [fetchBooks, fetchQuota, hasFetched, checkAndUpdateStreak]);

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

  // Handle classic book click - fetch, cache, and navigate to reader
  const handleClassicClick = useCallback(async (book: ClassicBook) => {
    // Navigate immediately - the reader page will handle loading
    router.push(`/reader/classic/${book.id}`);
  }, [router]);

  const isGoalMet = todayProgress.goalMet;

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
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 px-4 py-3 sm:px-5 sm:py-4 bg-[var(--bg-secondary)] rounded-[5px] shadow-lg sm:max-w-[280px]">
          <div className="flex items-center gap-3 mb-3">
            <Spinner size="sm" />
            <span className="text-sm">
              {uploadProgress
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                : 'Uploading...'}
            </span>
          </div>
          {uploadProgress && (
            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Toast */}
      {dragError && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 px-4 py-3 sm:px-5 sm:py-4 bg-[var(--bg-secondary)] rounded-[5px] shadow-lg sm:max-w-[280px]">
          <p className="text-sm">{dragError}</p>
        </div>
      )}

      {error && (
        <div className="p-4 sm:p-5 bg-[var(--bg-secondary)] rounded-[5px] mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {books.length === 0 ? (
        <>
          <div className="text-center py-20 md:py-28 bg-[var(--bg-secondary)] rounded-[5px] mb-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-[var(--bg-tertiary)] rounded-[5px] flex items-center justify-center">
              <PixelIcon name="library" size={28} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-2xl font-medium mb-2">No Books Yet</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto px-4">
              Upload your first EPUB, PDF, or MOBI file to get started
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <PixelIcon name="upload" size={16} />
              Upload Book
            </Button>
          </div>

          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
            onClassicClick={handleClassicClick}
          />
        </>
      ) : viewMode === 'home' ? (
        // Home view - Netflix style rows
        <div className="space-y-16 sm:space-y-20">
          {/* Library with View All and Streak */}
          <div>
            {/* Header row with streak and view all */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display fs-h-sm md:fs-h-lg uppercase tracking-tight">
                Library
              </h2>

              <div className="flex items-center gap-3">
                {/* Streak counter - simplified */}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 transition-colors',
                    isGoalMet
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <PixelIcon name="fire" size={14} />
                  <span className="font-mono fs-p-sm">{currentStreak}</span>
                </button>

                {/* View All */}
                <button
                  onClick={handleViewAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <span className="font-ui fs-p-sm">View All</span>
                  <PixelIcon name="chevron-right" size={12} />
                </button>
              </div>
            </div>

            {/* Books row */}
            <BookRow books={sortedBooks} title="" />
          </div>

          <BookRow
            title="Popular Classics"
            subtitle="Free public domain books"
            classicBooks={classicBooks}
            onClassicClick={handleClassicClick}
          />
        </div>
      ) : (
        // All books view - Grid with selection
        <>
          {/* Toolbar for All view - Mobile-first */}
          <div className="flex flex-col gap-3 mb-6 sm:mb-8">
            {/* Top row: back, search, actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleBackToHome}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-[5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                aria-label="Back"
              >
                <PixelIcon name="chevron-left" size={20} />
              </button>

              <div className="flex-1 relative">
                <PixelIcon
                  name="search"
                  size={16}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                />
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {isSelectionMode ? (
                  <button
                    onClick={handleExitSelection}
                    className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                    aria-label="Exit selection"
                  >
                    <PixelIcon name="close" size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                      aria-label="Select books"
                    >
                      <PixelIcon name="check" size={18} />
                    </button>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="w-11 h-11 flex items-center justify-center rounded-[5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                      aria-label="Upload book"
                    >
                      <PixelIcon name="upload" size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Selection mode bar */}
            {isSelectionMode && (
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 min-h-[44px] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {selectedBooks.size === filteredBooks.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-[var(--text-muted)] tabular-nums">
                    {selectedBooks.size} selected
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  disabled={selectedBooks.size === 0}
                >
                  Share
                </Button>
              </div>
            )}
          </div>

          {/* Search results message */}
          {searchQuery && (
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)] mb-4">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'}
            </p>
          )}

          {/* Grid */}
          {filteredBooks.length === 0 && searchQuery ? (
            <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-[5px]">
              <p className="text-[var(--text-secondary)]">No books found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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

      {/* Streak Modals */}
      <StreakModal />
      <StreakGoalModal />
    </div>
  );
}
