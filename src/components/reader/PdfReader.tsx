'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';
import { useReaderStore } from '@/lib/stores/reader-store';
import { useStreakStore } from '@/lib/stores/streak-store';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { READER_THEME_COLORS, READER_CONSTANTS, type ReaderTheme } from '@/lib/constants/reader-theme';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderSettings } from './ReaderSettings';
import { BookmarksList } from './BookmarksList';
import { HighlightsList } from './HighlightsList';
import { Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { StreakCelebration, StreakModal, StreakGoalModal } from '@/components/streak';

interface PdfReaderProps {
  book: Book;
}

interface PageState {
  pageNum: number;
  isRendered: boolean;
  height: number;
}

// Using pdfjs-dist types
import type { PDFDocumentProxy } from 'pdfjs-dist';

export function PdfReader({ book }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const renderVersionRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PageState[]>([]);
  const [pdfLib, setPdfLib] = useState<typeof import('pdfjs-dist') | null>(null);

  // Width control state (percentage of viewport)
  const [contentWidth, setContentWidth] = useState(65);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

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

  const {
    startReadingSession,
    endReadingSession,
    checkAndUpdateStreak,
  } = useStreakStore();

  // Get signed URL for the book file (handles both legacy URLs and new paths)
  const { url: signedFileUrl, isLoading: isUrlLoading, error: urlError } = useSignedUrl(book.file_url);

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const isCurrentPageBookmarked = bookmarks.some(
    (b) => b.page === currentPage
  );

  // Track reading session for streak (time-based)
  useEffect(() => {
    startReadingSession(currentPage);
    checkAndUpdateStreak();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        endReadingSession(currentPage);
      } else {
        startReadingSession(currentPage);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      endReadingSession(currentPage);
    };
  }, [startReadingSession, endReadingSession, checkAndUpdateStreak, currentPage]);

  // Handle drag to resize - using pointer events for better tracking
  const handleMouseDown = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragSide(side);
    dragStartX.current = e.clientX;
    dragStartWidth.current = contentWidth;
  }, [contentWidth]);

  // Global mouse move/up handlers for dragging
  useEffect(() => {
    if (!isDragging || !dragSide) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - dragStartX.current;
      const deltaPercent = (deltaX / window.innerWidth) * 100;

      let newWidth: number;
      if (dragSide === 'right') {
        newWidth = dragStartWidth.current + deltaPercent * 2;
      } else {
        newWidth = dragStartWidth.current - deltaPercent * 2;
      }

      // Clamp between 30% and 95%
      setContentWidth(Math.min(Math.max(30, newWidth), 95));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSide(null);
    };

    // Use capture phase for better event handling
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragSide]);

  // Render a specific page to its canvas
  const renderPage = useCallback(async (pageNum: number, forceRender = false) => {
    if (!pdfDocRef.current || !pdfLib) return;

    if (!forceRender && renderedPagesRef.current.has(pageNum)) return;

    const canvas = canvasRefs.current.get(pageNum);
    if (!canvas) return;

    try {
      renderedPagesRef.current.add(pageNum);

      const page = await pdfDocRef.current.getPage(pageNum);
      const context = canvas.getContext('2d');
      if (!context) return;

      // Calculate scale based on actual container width
      const containerEl = pagesContainerRef.current;
      const actualWidth = containerEl ? containerEl.clientWidth : (window.innerWidth * contentWidth / 100);
      const viewport = page.getViewport({ scale: 1 });
      const calculatedScale = (actualWidth - 40) / viewport.width;
      const finalScale = calculatedScale * scale;

      const scaledViewport = page.getViewport({ scale: finalScale });

      // Set canvas dimensions
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Clear and apply theme
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (settings.theme === 'dark') {
        context.filter = 'invert(1) hue-rotate(180deg)';
      } else if (settings.theme === 'sepia') {
        context.filter = 'sepia(0.3)';
      } else {
        context.filter = 'none';
      }

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;

      // Update page state with actual height
      setPages(prev => prev.map(p =>
        p.pageNum === pageNum ? { ...p, isRendered: true, height: scaledViewport.height } : p
      ));
    } catch {
      // Page rendering failed - allow retry
      renderedPagesRef.current.delete(pageNum);
    }
  }, [pdfLib, scale, settings.theme, contentWidth]);

  // Initialize PDF reader
  useEffect(() => {
    let mounted = true;

    // Wait for signed URL to be ready
    if (isUrlLoading || !signedFileUrl) {
      if (urlError) {
        setError(urlError);
        setIsLoading(false);
      }
      return;
    }

    const initReader = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        if (!mounted) return;
        setPdfLib(pdfjsLib);

        // Use signed URL for PDF loading
        const loadingTask = pdfjsLib.getDocument(signedFileUrl);
        const pdf = await loadingTask.promise;

        if (!mounted) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);

        // Initialize page states
        const initialPages: PageState[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          initialPages.push({
            pageNum: i,
            isRendered: false,
            height: 800,
          });
        }
        setPages(initialPages);

        // Load saved progress
        const savedProgress = await loadProgress(book.id);
        const startPage = savedProgress?.current_page || 1;
        setCurrentPage(startPage);

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        setIsLoading(false);

        // Scroll to saved page after a small delay
        if (startPage > 1) {
          setTimeout(() => {
            const pageElement = document.getElementById(`pdf-page-${startPage}`);
            if (pageElement) {
              pageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }, READER_CONSTANTS.SCROLL_TIMEOUT);
        }
      } catch {
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
        pdfDocRef.current.destroy();
      }
    };
  }, [signedFileUrl, isUrlLoading, urlError, book.id]);

  // Set up intersection observer for lazy loading and current page tracking
  useEffect(() => {
    if (isLoading || !pdfLib || pages.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '1', 10);

          if (entry.isIntersecting) {
            renderPage(pageNum);
            // Pre-render adjacent pages
            if (pageNum > 1) renderPage(pageNum - 1);
            if (pageNum < totalPages) renderPage(pageNum + 1);
          }
        });

        // Find most visible page
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, curr) =>
            curr.intersectionRatio > prev.intersectionRatio ? curr : prev
          );
          const pageNum = parseInt(mostVisible.target.getAttribute('data-page') || '1', 10);
          setCurrentPage(pageNum);
          updateProgress(book.id, String(pageNum), pageNum, (pageNum / totalPages) * 100);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '200px 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all page containers
    const pageElements = document.querySelectorAll('[data-page]');
    pageElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isLoading, pdfLib, pages.length, totalPages, renderPage, book.id, updateProgress]);

  // Re-render all pages when scale, theme, or contentWidth changes
  useEffect(() => {
    if (!pdfDocRef.current || isLoading || pages.length === 0) return;

    // Increment version to force re-render
    renderVersionRef.current += 1;

    // Clear cache
    renderedPagesRef.current.clear();

    // Reset all pages as not rendered
    setPages(prev => prev.map(p => ({ ...p, isRendered: false })));

    // Re-render visible pages immediately
    requestAnimationFrame(() => {
      const visiblePages = document.querySelectorAll('[data-page]');
      visiblePages.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          const pageNum = parseInt(el.getAttribute('data-page') || '1', 10);
          renderPage(pageNum, true);
        }
      });
    });
  }, [scale, settings.theme, contentWidth, isLoading, pages.length]);

  // Register canvas refs
  const setCanvasRef = useCallback((pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvasRefs.current.set(pageNum, canvas);
    } else {
      canvasRefs.current.delete(pageNum);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.25, 3));
      } else if (e.key === '-') {
        setScale((s) => Math.max(s - 0.25, 0.5));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      const pageElement = document.getElementById(`pdf-page-${page}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  // Jump to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      const pageElement = document.getElementById(`pdf-page-${page}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [totalPages]);

  // Get theme background color using shared constants
  const getThemeBackground = useCallback(() => {
    const theme = (settings.theme as ReaderTheme) || 'light';
    // For PDF, we use a slightly lighter background for light mode for better contrast
    if (theme === 'light') return '#f5f5f5';
    return READER_THEME_COLORS[theme].bg;
  }, [settings.theme]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="close" size={24} className="text-[var(--text-secondary)]" />
          </div>
          <h2 className="font-display fs-h-sm uppercase mb-2">Error Loading PDF</h2>
          <p className="font-ui fs-p-lg text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: getThemeBackground() }}>
      <ReaderToolbar
        title={book.title}
        progress={progress}
        onBookmark={handleBookmarkToggle}
        isBookmarked={isCurrentPageBookmarked}
      />

      {/* Left drag handle - invisible until hover */}
      <div
        className="fixed top-[60px] bottom-0 w-8 z-40 group"
        style={{ left: `calc(${(100 - contentWidth) / 2}% - 16px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 transition-all duration-200',
          'opacity-0 group-hover:opacity-60 group-hover:cursor-ew-resize',
          'bg-[var(--text-secondary)]',
          isDragging && dragSide === 'left' && 'opacity-100 w-1 h-24 bg-[var(--text-primary)]'
        )} style={{ opacity: isDragging && dragSide === 'left' ? 1 : undefined }} />
      </div>

      {/* Right drag handle - invisible until hover */}
      <div
        className="fixed top-[60px] bottom-0 w-8 z-40 group"
        style={{ right: `calc(${(100 - contentWidth) / 2}% - 16px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 transition-all duration-200',
          'opacity-0 group-hover:opacity-60 group-hover:cursor-ew-resize',
          'bg-[var(--text-secondary)]',
          isDragging && dragSide === 'right' && 'opacity-100 w-1 h-24 bg-[var(--text-primary)]'
        )} style={{ opacity: isDragging && dragSide === 'right' ? 1 : undefined }} />
      </div>

      {/* PDF Container - Infinite Scroll */}
      <div
        ref={containerRef}
        className="fixed inset-0 pt-[60px] overflow-y-auto overflow-x-hidden"
        style={{ background: getThemeBackground() }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: getThemeBackground() }}>
            <div className="flex flex-col items-center gap-4 p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="animate-spin">
                <PixelIcon name="loading" size={24} />
              </div>
              <p className="font-ui fs-p-sm uppercase tracking-wide">
                Loading PDF...
              </p>
            </div>
          </div>
        )}

        {/* Content wrapper with adjustable width */}
        <div
          ref={pagesContainerRef}
          className={clsx('mx-auto py-4 transition-[width] duration-75', isLoading && 'invisible')}
          style={{ width: `${contentWidth}%` }}
        >
          {/* All PDF Pages - Infinite Scroll */}
          <div className="flex flex-col items-center gap-4">
            {pages.map((page) => (
              <div
                key={page.pageNum}
                id={`pdf-page-${page.pageNum}`}
                data-page={page.pageNum}
                className="relative flex items-center justify-center w-full"
                style={{ minHeight: page.height || 800 }}
              >
                <canvas
                  ref={(canvas) => setCanvasRef(page.pageNum, canvas)}
                  className="shadow-[4px_4px_0_var(--black)] max-w-full"
                />
                {!page.isRendered && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                    <div className="text-center">
                      <PixelIcon name="loading" size={20} className="animate-spin mx-auto mb-2" />
                      <p className="font-mono fs-p-sm">Page {page.pageNum}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
          <span className="font-mono fs-p-sm text-center bg-[var(--bg-primary)] border border-[var(--border-primary)] px-2 py-1">
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

        {/* Page Jump Control */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-2">
          <span className="font-ui fs-p-sm uppercase tracking-wide text-[var(--text-secondary)]">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-14 text-center font-mono fs-p-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-2 py-1"
          />
          <span className="font-mono fs-p-lg text-[var(--text-secondary)]">/ {totalPages}</span>
        </div>
      </div>

      {/* Width indicator during drag */}
      {isDragging && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-1 font-mono fs-p-lg">
          {Math.round(contentWidth)}%
        </div>
      )}

      {/* Modals */}
      <ReaderSettings />
      <BookmarksList onNavigate={handleNavigate} />
      <HighlightsList onNavigate={handleNavigate} />

      {/* Streak */}
      <StreakModal />
      <StreakGoalModal />
      <StreakCelebration />
    </div>
  );
}
