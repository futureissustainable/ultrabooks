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

interface SpineSection {
  id: string;
  href: string;
  html: string;
}

export function EpubReader({ book }: EpubReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<unknown>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [sections, setSections] = useState<SpineSection[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [progress, setProgress] = useState(0);

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

  const isCurrentLocationBookmarked = bookmarks.some(
    (b) => b.location === currentSection
  );

  // Handle drag to resize
  const handleMouseDown = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragSide(side);
    dragStartX.current = e.clientX;
    dragStartWidth.current = contentWidth;
  }, [contentWidth]);

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

      setContentWidth(Math.min(Math.max(30, newWidth), 95));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSide(null);
    };

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

  // Track scroll position and update current section
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);

      // Find current section based on scroll position
      let currentId = sections[0]?.id || '';
      for (const [id, el] of sectionRefs.current.entries()) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = id;
        }
      }

      if (currentId !== currentSection) {
        setCurrentSection(currentId);
        updateProgress(book.id, currentId, 0, scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, currentSection, book.id, updateProgress]);

  // Initialize EPUB reader - extract ALL content for infinite scroll
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        const ePub = (await import('epubjs')).default;

        if (!mounted) return;

        const epubBook = ePub(book.file_url);
        bookRef.current = epubBook;

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

        // Get all spine items and extract their HTML content
        const spine = epubBook.spine as unknown as { each: (fn: (item: { href: string; load: (book: unknown) => Promise<{ document: Document }> }) => void) => void };
        const loadedSections: SpineSection[] = [];

        // Load all sections
        await new Promise<void>((resolve) => {
          const items: Array<{ href: string; load: (book: unknown) => Promise<{ document: Document }> }> = [];
          spine.each((item) => items.push(item));

          Promise.all(
            items.map(async (item, index) => {
              try {
                const content = await item.load(epubBook);
                const doc = content.document;
                const body = doc.body;

                // Process images to use absolute URLs
                const images = body.querySelectorAll('img');
                images.forEach((img) => {
                  const src = img.getAttribute('src');
                  if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    // Try to resolve relative URL
                    const baseHref = item.href;
                    const basePath = baseHref.substring(0, baseHref.lastIndexOf('/') + 1);
                    img.setAttribute('src', basePath + src);
                  }
                });

                // Get the HTML content
                const html = body.innerHTML;

                return {
                  index,
                  id: item.href,
                  href: item.href,
                  html,
                };
              } catch (err) {
                console.warn(`Failed to load section ${item.href}:`, err);
                return null;
              }
            })
          ).then((results) => {
            const validResults = results
              .filter((r): r is NonNullable<typeof r> => r !== null)
              .sort((a, b) => a.index - b.index);

            loadedSections.push(...validResults.map(r => ({
              id: r.id,
              href: r.href,
              html: r.html,
            })));
            resolve();
          });
        });

        if (!mounted) return;

        setSections(loadedSections);

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        // Load saved progress
        const savedProgress = await loadProgress(book.id);

        setIsLoading(false);

        // Scroll to saved position after content renders
        if (savedProgress?.current_location) {
          setTimeout(() => {
            const el = sectionRefs.current.get(savedProgress.current_location);
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }, 100);
        }
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

  // Navigation handlers
  const handleNavigate = useCallback((href: string) => {
    // Find the section with this href
    const el = sectionRefs.current.get(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Try to find by partial match
      for (const [id, element] of sectionRefs.current.entries()) {
        if (id.includes(href) || href.includes(id)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    }
  }, []);

  const handleBookmarkToggle = useCallback(() => {
    const existing = bookmarks.find((b) => b.location === currentSection);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(book.id, currentSection, 0, currentSection);
    }
  }, [bookmarks, currentSection, book.id, addBookmark, removeBookmark]);

  // Register section refs
  const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  // Get theme styles
  const getThemeStyles = () => {
    switch (settings.theme) {
      case 'dark':
        return { background: '#000000', color: '#ffffff' };
      case 'sepia':
        return { background: '#f4ecd8', color: '#5b4636' };
      default:
        return { background: '#ffffff', color: '#000000' };
    }
  };

  const themeStyles = getThemeStyles();

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
    <div className="min-h-screen" style={{ background: themeStyles.background, color: themeStyles.color }}>
      <ReaderToolbar
        title={book.title}
        currentPage={Math.round(progress)}
        totalPages={100}
        progress={progress}
        onBookmark={handleBookmarkToggle}
        isBookmarked={isCurrentLocationBookmarked}
      />

      {/* Left drag handle */}
      <div
        className={clsx(
          'fixed top-[60px] bottom-0 w-4 cursor-ew-resize z-40 group',
          isDragging && dragSide === 'left' && 'bg-[var(--color-accent)]/30'
        )}
        style={{ left: `calc(${(100 - contentWidth) / 2}% - 8px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-20 rounded-full transition-all',
          'bg-gray-400 group-hover:bg-[var(--color-accent)] group-hover:w-2 group-hover:h-24',
          isDragging && dragSide === 'left' && 'bg-[var(--color-accent)] w-2 h-24'
        )} />
      </div>

      {/* Right drag handle */}
      <div
        className={clsx(
          'fixed top-[60px] bottom-0 w-4 cursor-ew-resize z-40 group',
          isDragging && dragSide === 'right' && 'bg-[var(--color-accent)]/30'
        )}
        style={{ right: `calc(${(100 - contentWidth) / 2}% - 8px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-20 rounded-full transition-all',
          'bg-gray-400 group-hover:bg-[var(--color-accent)] group-hover:w-2 group-hover:h-24',
          isDragging && dragSide === 'right' && 'bg-[var(--color-accent)] w-2 h-24'
        )} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: themeStyles.background }}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <PixelIcon name="loading" size={32} />
            </div>
            <p className="font-ui text-sm uppercase tracking-wide animate-pulse-brutal">
              Loading book...
            </p>
          </div>
        </div>
      )}

      {/* Main content - TRUE infinite scroll */}
      <div
        ref={contentRef}
        className="pt-[60px] pb-20 mx-auto transition-[width] duration-75"
        style={{
          width: `${contentWidth}%`,
          fontFamily: `${settings.fontFamily}, serif`,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          textAlign: settings.textAlign as 'left' | 'justify',
        }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            ref={(el) => setSectionRef(section.id, el)}
            data-section={section.id}
            className="epub-section"
            style={{ padding: `${settings.margins}px` }}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        ))}
      </div>

      {/* Width indicator during drag */}
      {isDragging && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-3 py-1 rounded font-mono text-sm">
          {Math.round(contentWidth)}%
        </div>
      )}

      {/* Modals */}
      <TableOfContents
        items={toc}
        currentHref={currentSection}
        onNavigate={handleNavigate}
      />
      <ReaderSettings />
      <BookmarksList onNavigate={handleNavigate} />
      <HighlightsList onNavigate={handleNavigate} />
    </div>
  );
}
