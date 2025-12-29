'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';
import { useReaderStore } from '@/lib/stores/reader-store';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderSettings } from './ReaderSettings';
import { TableOfContents } from './TableOfContents';
import { BookmarksList } from './BookmarksList';
import { HighlightsList } from './HighlightsList';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface EpubReaderProps {
  book: Book;
}

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

export function EpubReader({ book }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<unknown>(null);
  const bookRef = useRef<unknown>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentHref, setCurrentHref] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const {
    settings,
    loadProgress,
    updateProgress,
    bookmarks,
    loadBookmarks,
    addBookmark,
    removeBookmark,
    highlights,
    loadHighlights,
    addHighlight,
  } = useReaderStore();

  const isCurrentLocationBookmarked = bookmarks.some(
    (b) => b.location === currentHref
  );

  // Initialize EPUB reader
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        // Dynamic import for epub.js (client-side only)
        const ePub = (await import('epubjs')).default;

        if (!mounted || !containerRef.current) return;

        // Create book instance
        const epubBook = ePub(book.file_url);
        bookRef.current = epubBook;

        // Wait for book to be ready
        await epubBook.ready;

        if (!mounted) return;

        // Get table of contents
        const navigation = await epubBook.loaded.navigation;
        if (navigation?.toc) {
          const formatToc = (items: unknown[]): TocItem[] => {
            return (items as Array<{id?: string; href?: string; label?: string; subitems?: unknown[]}>).map((item) => ({
              id: item.id || '',
              href: item.href || '',
              label: item.label || '',
              subitems: item.subitems ? formatToc(item.subitems) : undefined,
            }));
          };
          setToc(formatToc(navigation.toc));
        }

        // Create rendition
        const rendition = epubBook.renderTo(containerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        });
        renditionRef.current = rendition;

        // Apply initial theme/styles
        applyStyles(rendition);

        // Load saved progress or display first page
        const savedProgress = await loadProgress(book.id);
        if (savedProgress?.current_location) {
          rendition.display(savedProgress.current_location);
        } else {
          rendition.display();
        }

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        // Handle location changes
        rendition.on('relocated', (location: {start: {cfi: string; href: string; percentage: number; displayed: {page: number; total: number}}}) => {
          if (!mounted) return;

          const { cfi, href, percentage, displayed } = location.start;
          setCurrentHref(href);
          setProgress(percentage * 100);
          setCurrentPage(displayed.page);
          setTotalPages(displayed.total);

          // Save progress
          updateProgress(book.id, cfi, displayed.page, percentage * 100);
        });

        // Handle text selection for highlighting
        rendition.on('selected', (cfiRange: string, contents: unknown) => {
          const selection = (contents as {window: Window}).window.getSelection();
          if (selection && selection.toString().trim()) {
            const text = selection.toString().trim();
            if (text.length > 0) {
              addHighlight(book.id, cfiRange, text, 'yellow');
              selection.removeAllRanges();
            }
          }
        });

        // Handle click events for navigation
        rendition.on('click', (e: MouseEvent) => {
          const { clientX } = e;
          const { innerWidth } = window;

          // Click on left third = prev, right third = next
          if (clientX < innerWidth / 3) {
            rendition.prev();
          } else if (clientX > (innerWidth * 2) / 3) {
            rendition.next();
          }
        });

        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight' || e.key === ' ') {
            rendition.next();
          } else if (e.key === 'ArrowLeft') {
            rendition.prev();
          }
        };
        document.addEventListener('keydown', handleKeyDown);

        setIsLoading(false);

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      } catch (err) {
        console.error('Error loading EPUB:', err);
        if (mounted) {
          setError('Failed to load book. Please try again.');
          setIsLoading(false);
        }
      }
    };

    initReader();

    return () => {
      mounted = false;
      if (bookRef.current) {
        (bookRef.current as {destroy: () => void}).destroy();
      }
    };
  }, [book.file_url, book.id]);

  // Apply reader settings
  const applyStyles = useCallback((rendition: unknown) => {
    if (!rendition) return;

    const themes: Record<string, { body: Record<string, string> }> = {
      light: {
        body: {
          background: '#ffffff',
          color: '#000000',
        },
      },
      dark: {
        body: {
          background: '#1a1a1a',
          color: '#e0e0e0',
        },
      },
      sepia: {
        body: {
          background: '#f4ecd8',
          color: '#5b4636',
        },
      },
    };

    const theme = themes[settings.theme] || themes.light;

    (rendition as {themes: {default: (style: Record<string, unknown>) => void}}).themes.default({
      body: {
        ...theme.body,
        'font-family': `${settings.fontFamily}, serif !important`,
        'font-size': `${settings.fontSize}px !important`,
        'line-height': `${settings.lineHeight} !important`,
        'text-align': `${settings.textAlign} !important`,
        padding: `${settings.margins}px !important`,
      },
      p: {
        'font-family': 'inherit !important',
        'font-size': 'inherit !important',
        'line-height': 'inherit !important',
      },
    });
  }, [settings]);

  // Update styles when settings change
  useEffect(() => {
    if (renditionRef.current) {
      applyStyles(renditionRef.current);
    }
  }, [settings, applyStyles]);

  // Navigation handlers
  const handleNavigate = useCallback((href: string) => {
    if (renditionRef.current) {
      (renditionRef.current as {display: (href: string) => void}).display(href);
    }
  }, []);

  const handleBookmarkToggle = useCallback(() => {
    const existing = bookmarks.find((b) => b.location === currentHref);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(book.id, currentHref, currentPage, `Page ${currentPage}`);
    }
  }, [bookmarks, currentHref, currentPage, book.id, addBookmark, removeBookmark]);

  // Get theme background color for container
  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'dark':
        return '#1a1a1a';
      case 'sepia':
        return '#f4ecd8';
      default:
        return '#ffffff';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8">
          <PixelIcon name="close" size={48} className="mx-auto mb-4 text-[var(--color-accent)]" />
          <h2 className="font-display text-xl mb-2">Error Loading Book</h2>
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
        isBookmarked={isCurrentLocationBookmarked}
      />

      {/* Reader Container */}
      <div
        className={clsx(
          'fixed inset-0 pt-[60px]',
          isLoading && 'flex items-center justify-center'
        )}
        style={{ background: getThemeBackground() }}
      >
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <PixelIcon name="loading" size={32} />
            </div>
            <p className="font-ui text-sm uppercase tracking-wide animate-pulse-brutal">
              Loading book...
            </p>
          </div>
        )}
        <div
          ref={containerRef}
          className={clsx('w-full h-full', isLoading && 'invisible')}
        />
      </div>

      {/* Modals */}
      <TableOfContents
        items={toc}
        currentHref={currentHref}
        onNavigate={handleNavigate}
      />
      <ReaderSettings />
      <BookmarksList onNavigate={handleNavigate} />
      <HighlightsList onNavigate={handleNavigate} />
    </div>
  );
}
