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

interface PageState {
  pageNum: number;
  isRendered: boolean;
  isVisible: boolean;
  height: number;
}

export function PdfReader({ book }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pdfDocRef = useRef<unknown>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PageState[]>([]);
  const [pdfLib, setPdfLib] = useState<unknown>(null);

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

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const isCurrentPageBookmarked = bookmarks.some(
    (b) => b.page === currentPage
  );

  // Handle drag to resize - improved logic
  const handleMouseDown = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setIsDragging(true);
    setDragSide(side);
    dragStartX.current = e.clientX;
    dragStartWidth.current = contentWidth;
  }, [contentWidth]);

  useEffect(() => {
    if (!isDragging || !dragSide) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaPercent = (deltaX / window.innerWidth) * 100;

      let newWidth: number;
      if (dragSide === 'right') {
        newWidth = dragStartWidth.current + deltaPercent * 2;
      } else {
        newWidth = dragStartWidth.current - deltaPercent * 2;
      }

      setContentWidth(Math.min(Math.max(30, newWidth), 95));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSide(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragSide]);

  // Render a specific page to its canvas
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || !pdfLib || renderedPagesRef.current.has(pageNum)) return;

    const canvas = canvasRefs.current.get(pageNum);
    if (!canvas) return;

    try {
      renderedPagesRef.current.add(pageNum);

      const page = await (pdfDocRef.current as {getPage: (num: number) => Promise<unknown>}).getPage(pageNum);
      const context = canvas.getContext('2d');
      if (!context) return;

      // Calculate scale based on container width
      const containerWidth = pagesContainerRef.current?.clientWidth || 800;
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

      // Update page height for proper spacing
      setPages(prev => prev.map(p =>
        p.pageNum === pageNum ? { ...p, isRendered: true, height: scaledViewport.height } : p
      ));
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
      renderedPagesRef.current.delete(pageNum);
    }
  }, [pdfLib, scale, settings.theme]);

  // Initialize PDF reader
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        if (!mounted) return;
        setPdfLib(pdfjsLib);

        const loadingTask = pdfjsLib.getDocument(book.file_url);
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
            isVisible: false,
            height: 800, // Default height, will be updated after render
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
          }, 100);
        }
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

  // Set up intersection observer for lazy loading and current page tracking
  useEffect(() => {
    if (isLoading || !pdfLib) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '1', 10);

          if (entry.isIntersecting) {
            // Render the page if it's visible
            renderPage(pageNum);

            // Also pre-render adjacent pages
            if (pageNum > 1) renderPage(pageNum - 1);
            if (pageNum < totalPages) renderPage(pageNum + 1);
          }
        });

        // Find the most visible page to set as current
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio to find the most visible page
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
  }, [isLoading, pdfLib, totalPages, renderPage, book.id, updateProgress]);

  // Re-render all visible pages when scale or theme changes
  useEffect(() => {
    if (!pdfDocRef.current || isLoading) return;

    // Clear rendered pages cache to force re-render
    renderedPagesRef.current.clear();

    // Re-render currently visible pages
    pages.forEach((page) => {
      if (page.isRendered) {
        renderPage(page.pageNum);
      }
    });
  }, [scale, settings.theme]);

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

  // Get theme background color
  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'dark':
        return '#000000';
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

      {/* PDF Container - Infinite Scroll */}
      <div
        ref={containerRef}
        className="fixed inset-0 pt-[60px] overflow-y-auto overflow-x-hidden"
        style={{ background: getThemeBackground() }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: getThemeBackground() }}>
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

        {/* Content wrapper with adjustable width */}
        <div
          ref={pagesContainerRef}
          className={clsx('mx-auto relative py-4', isLoading && 'invisible')}
          style={{ width: `${contentWidth}%` }}
        >
          {/* Left drag handle */}
          <div
            className={clsx(
              'fixed top-[60px] bottom-0 w-3 cursor-ew-resize z-20',
              'hover:bg-[var(--color-accent)] hover:opacity-40 transition-opacity',
              isDragging && dragSide === 'left' && 'bg-[var(--color-accent)] opacity-40'
            )}
            style={{
              left: `${(100 - contentWidth) / 2}%`,
              transform: 'translateX(-100%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-[var(--border-primary)] rounded opacity-50" />
          </div>

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
                  className="shadow-lg max-w-full"
                />
                {!page.isRendered && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                    <div className="text-center">
                      <PixelIcon name="loading" size={24} className="animate-spin mx-auto mb-2" />
                      <p className="font-mono text-sm">Page {page.pageNum}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right drag handle */}
          <div
            className={clsx(
              'fixed top-[60px] bottom-0 w-3 cursor-ew-resize z-20',
              'hover:bg-[var(--color-accent)] hover:opacity-40 transition-opacity',
              isDragging && dragSide === 'right' && 'bg-[var(--color-accent)] opacity-40'
            )}
            style={{
              right: `${(100 - contentWidth) / 2}%`,
              transform: 'translateX(100%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-[var(--border-primary)] rounded opacity-50" />
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

        {/* Page Jump Control */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wide opacity-60">Go to</span>
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
      </div>

      {/* Modals */}
      <ReaderSettings />
      <BookmarksList onNavigate={handleNavigate} />
      <HighlightsList onNavigate={handleNavigate} />
    </div>
  );
}
