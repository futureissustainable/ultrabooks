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

interface Section {
  id: string;
  html: string;
}

export function EpubReader({ book }: EpubReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Width control state
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

  // Track scroll position
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);

      // Find current section
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

  // Initialize reader with foliate-js
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        setLoadingStatus('Fetching book...');

        // Fetch the book file
        const response = await fetch(book.file_url);
        if (!response.ok) throw new Error('Failed to fetch book file');

        const blob = await response.blob();
        const file = new File([blob], book.title, { type: blob.type });

        if (!mounted) return;
        setLoadingStatus('Parsing book...');

        // Use foliate-js to parse the book
        const { makeBook } = await import('foliate-js/view.js');
        const foliate = await makeBook(file);

        if (!mounted) return;
        setLoadingStatus('Loading chapters...');

        // Extract TOC
        if (foliate.toc) {
          const formatToc = (items: unknown[]): TocItem[] => {
            return (items as Array<{ href?: string; label?: string; subitems?: unknown[] }>).map((item, i) => ({
              id: item.href || `toc-${i}`,
              href: item.href || '',
              label: item.label || `Chapter ${i + 1}`,
              subitems: item.subitems ? formatToc(item.subitems) : undefined,
            }));
          };
          setToc(formatToc(foliate.toc));
        }

        // Load all sections for infinite scroll
        const loadedSections: Section[] = [];
        const totalSections = foliate.sections?.length || 0;

        for (let i = 0; i < totalSections; i++) {
          const section = foliate.sections[i];
          if (!section) continue;

          setLoadingStatus(`Loading chapter ${i + 1} of ${totalSections}...`);

          try {
            // Get the document for this section
            const doc = await section.createDocument();
            if (!doc?.body) continue;

            // Process images - convert to blob URLs
            const images = doc.body.querySelectorAll('img');
            for (const img of images) {
              const src = img.getAttribute('src');
              if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                // Images in EPUBs are relative, we'll try to load them
                // For now, just mark them as potentially broken
                img.setAttribute('data-original-src', src);
              }
            }

            // Get HTML content
            const html = doc.body.innerHTML;
            if (html.trim()) {
              loadedSections.push({
                id: section.id || `section-${i}`,
                html,
              });
            }
          } catch (err) {
            console.warn(`Failed to load section ${i}:`, err);
          }
        }

        if (!mounted) return;

        if (loadedSections.length === 0) {
          throw new Error('No content found in book');
        }

        setSections(loadedSections);

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        // Load saved progress
        const savedProgress = await loadProgress(book.id);

        setIsLoading(false);

        // Scroll to saved position
        if (savedProgress?.current_location) {
          setTimeout(() => {
            const el = sectionRefs.current.get(savedProgress.current_location);
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }, 100);
        }
      } catch (err) {
        console.error('Error loading book:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load book');
          setIsLoading(false);
        }
      }
    };

    initReader();

    return () => {
      mounted = false;
    };
  }, [book.file_url, book.id, book.title]);

  // Navigation
  const handleNavigate = useCallback((href: string) => {
    const el = sectionRefs.current.get(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Try partial match
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

  const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  // Theme styles
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

      {/* Left drag handle - invisible until hover */}
      <div
        className="fixed top-[60px] bottom-0 w-8 z-40 group"
        style={{ left: `calc(${(100 - contentWidth) / 2}% - 16px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 rounded-full transition-all duration-200',
          'opacity-0 group-hover:opacity-100 group-hover:cursor-ew-resize',
          'bg-current',
          isDragging && dragSide === 'left' && 'opacity-100 w-1 h-24 bg-[var(--color-accent)]'
        )} style={{ opacity: isDragging && dragSide === 'left' ? 1 : undefined }} />
      </div>

      {/* Right drag handle - invisible until hover */}
      <div
        className="fixed top-[60px] bottom-0 w-8 z-40 group"
        style={{ right: `calc(${(100 - contentWidth) / 2}% - 16px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      >
        <div className={clsx(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 rounded-full transition-all duration-200',
          'opacity-0 group-hover:opacity-100 group-hover:cursor-ew-resize',
          'bg-current',
          isDragging && dragSide === 'right' && 'opacity-100 w-1 h-24 bg-[var(--color-accent)]'
        )} style={{ opacity: isDragging && dragSide === 'right' ? 1 : undefined }} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: themeStyles.background }}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <PixelIcon name="loading" size={32} />
            </div>
            <p className="font-ui text-sm uppercase tracking-wide animate-pulse-brutal">
              {loadingStatus}
            </p>
          </div>
        </div>
      )}

      {/* Main content - infinite scroll */}
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

      {/* Width indicator */}
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
