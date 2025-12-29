'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';
import { useReaderStore } from '@/lib/stores/reader-store';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderSettings } from './ReaderSettings';
import { BookmarksList } from './BookmarksList';
import { HighlightsList } from './HighlightsList';
import { Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface PdfReaderProps {
  book: Book;
}

export function PdfReader({ book }: PdfReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<unknown>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);

  const {
    settings,
    loadProgress,
    updateProgress,
    bookmarks,
    loadBookmarks,
    addBookmark,
    removeBookmark,
    loadHighlights,
  } = useReaderStore();

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const isCurrentPageBookmarked = bookmarks.some(
    (b) => b.page === currentPage
  );

  // Initialize PDF reader
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        // Dynamic import for pdfjs
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        if (!mounted) return;

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(book.file_url);
        const pdf = await loadingTask.promise;

        if (!mounted) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);

        // Load saved progress
        const savedProgress = await loadProgress(book.id);
        const startPage = savedProgress?.current_page || 1;
        setCurrentPage(startPage);

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        // Render first page
        await renderPage(pdf, startPage);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (mounted) {
          setError('Failed to load PDF. Please try again.');
          setIsLoading(false);
        }
      }
    };

    initReader();

    return () => {
      mounted = false;
      if (pdfDocRef.current) {
        (pdfDocRef.current as {destroy: () => void}).destroy();
      }
    };
  }, [book.file_url, book.id]);

  // Render a specific page
  const renderPage = async (pdf: unknown, pageNum: number) => {
    if (!canvasRef.current) return;

    try {
      const page = await (pdf as {getPage: (num: number) => Promise<unknown>}).getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Calculate scale based on container width
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = (page as {getViewport: (opts: {scale: number}) => {width: number; height: number}}).getViewport({ scale: 1 });
      const calculatedScale = (containerWidth - 40) / viewport.width;
      const finalScale = calculatedScale * scale;

      const scaledViewport = (page as {getViewport: (opts: {scale: number}) => {width: number; height: number}}).getViewport({ scale: finalScale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      // Apply theme colors
      if (settings.theme === 'dark') {
        context.filter = 'invert(1) hue-rotate(180deg)';
      } else if (settings.theme === 'sepia') {
        context.filter = 'sepia(0.3)';
      } else {
        context.filter = 'none';
      }

      await (page as {render: (opts: {canvasContext: CanvasRenderingContext2D; viewport: unknown}) => {promise: Promise<void>}}).render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDocRef.current && !isLoading) {
      renderPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage, scale, settings.theme, isLoading]);

  // Navigation
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        updateProgress(book.id, String(page), page, (page / totalPages) * 100);
      }
    },
    [totalPages, book.id, updateProgress]
  );

  const goToPrev = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.25, 3));
      } else if (e.key === '-') {
        setScale((s) => Math.max(s - 0.25, 0.5));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    const existing = bookmarks.find((b) => b.page === currentPage);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(book.id, String(currentPage), currentPage, `Page ${currentPage}`);
    }
  }, [bookmarks, currentPage, book.id, addBookmark, removeBookmark]);

  // Handle navigate from bookmarks list
  const handleNavigate = useCallback((location: string) => {
    const page = parseInt(location, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  }, [goToPage]);

  // Get theme background color
  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'dark':
        return '#1a1a1a';
      case 'sepia':
        return '#f4ecd8';
      default:
        return '#f5f5f5';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8">
          <PixelIcon name="close" size={48} className="mx-auto mb-4 text-[var(--color-accent)]" />
          <h2 className="font-display text-xl mb-2">Error Loading PDF</h2>
          <p className="font-ui text-sm text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: getThemeBackground() }}>
      <ReaderToolbar
        title={book.title}
        currentPage={currentPage}
        totalPages={totalPages}
        progress={progress}
        onBookmark={handleBookmarkToggle}
        isBookmarked={isCurrentPageBookmarked}
      />

      {/* PDF Container */}
      <div
        className="fixed inset-0 pt-[60px] overflow-auto"
        style={{ background: getThemeBackground() }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: getThemeBackground() }}>
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <PixelIcon name="loading" size={32} />
              </div>
              <p className="font-ui text-sm uppercase tracking-wide animate-pulse-brutal">
                Loading PDF...
              </p>
            </div>
          </div>
        )}

        {/* PDF Content - always rendered, hidden during loading */}
        <div className={clsx('flex flex-col items-center py-4 px-4', isLoading && 'invisible')}>
          {/* Zoom Controls */}
          <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
              aria-label="Zoom in"
            >
              <PixelIcon name="plus" size={16} />
            </Button>
            <span className="font-mono text-xs text-center bg-[var(--bg-primary)] border border-[var(--border-primary)] px-2 py-1">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
              aria-label="Zoom out"
            >
              <PixelIcon name="minus" size={16} />
            </Button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="shadow-lg max-w-full"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  goToPrev();
                } else {
                  goToNext();
                }
              }
            }}
          />

          {/* Page Navigation */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrev}
              disabled={currentPage <= 1}
            >
              <PixelIcon name="chevron-left" size={16} />
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-12 text-center font-mono text-sm border border-[var(--border-primary)] bg-[var(--bg-primary)]"
              />
              <span className="font-mono text-sm">/ {totalPages}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentPage >= totalPages}
            >
              <PixelIcon name="chevron-right" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReaderSettings />
      <BookmarksList onNavigate={handleNavigate} />
      <HighlightsList onNavigate={handleNavigate} />
    </div>
  );
}
