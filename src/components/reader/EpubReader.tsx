'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { Book } from '@/lib/supabase/types';
import { useReaderStore } from '@/lib/stores/reader-store';
import { useStreakStore } from '@/lib/stores/streak-store';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderSettings } from './ReaderSettings';
import { TableOfContents } from './TableOfContents';
import { BookmarksList } from './BookmarksList';
import { HighlightsList } from './HighlightsList';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { StreakCelebration, StreakModal, StreakGoalModal } from '@/components/streak';

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

interface SelectionInfo {
  text: string;
  sectionId: string;
  range: Range;
  rect: DOMRect;
}

export function EpubReader({ book }: EpubReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const blobUrlsRef = useRef<string[]>([]);

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

  // Selection and highlight state
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);

  const {
    settings,
    loadSettings,
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

  const { startReadingSession, endReadingSession, checkAndUpdateStreak } = useStreakStore();

  const isCurrentLocationBookmarked = bookmarks.some(
    (b) => b.location === currentSection
  );

  // Track reading session for streak
  useEffect(() => {
    startReadingSession();
    checkAndUpdateStreak();

    // End session when component unmounts or page hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endReadingSession();
      } else {
        startReadingSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      endReadingSession();
    };
  }, [startReadingSession, endReadingSession, checkAndUpdateStreak]);

  // Generate theme colors
  const getThemeColors = useCallback(() => {
    switch (settings.theme) {
      case 'dark':
        return { background: '#000000', color: '#ffffff', linkColor: '#ef4444' };
      case 'sepia':
        return { background: '#f4ecd8', color: '#5b4636', linkColor: '#b91c1c' };
      default:
        return { background: '#ffffff', color: '#000000', linkColor: '#dc2626' };
    }
  }, [settings.theme]);

  // Inject dynamic CSS to force settings on EPUB content
  useEffect(() => {
    const colors = getThemeColors();

    // Create or update the style element
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.id = 'epub-reader-dynamic-styles';
      document.head.appendChild(styleRef.current);
    }

    // CSS with !important to override EPUB embedded styles
    styleRef.current.textContent = `
      .epub-section,
      .epub-section * {
        font-family: ${settings.fontFamily}, Georgia, serif !important;
        line-height: ${settings.lineHeight} !important;
        text-align: ${settings.textAlign} !important;
        color: ${colors.color} !important;
        background-color: transparent !important;
      }

      .epub-section {
        font-size: ${settings.fontSize}px !important;
      }

      .epub-section p,
      .epub-section div,
      .epub-section span,
      .epub-section li,
      .epub-section td,
      .epub-section th,
      .epub-section blockquote {
        font-size: inherit !important;
      }

      .epub-section h1 { font-size: 2em !important; font-weight: bold !important; }
      .epub-section h2 { font-size: 1.5em !important; font-weight: bold !important; }
      .epub-section h3 { font-size: 1.25em !important; font-weight: bold !important; }
      .epub-section h4 { font-size: 1.1em !important; font-weight: bold !important; }
      .epub-section h5 { font-size: 1em !important; font-weight: bold !important; }
      .epub-section h6 { font-size: 0.9em !important; font-weight: bold !important; }

      .epub-section a {
        color: ${colors.linkColor} !important;
      }

      .epub-section pre,
      .epub-section code {
        font-family: 'SF Mono', Monaco, Consolas, monospace !important;
        font-size: 0.9em !important;
      }

      .epub-section img,
      .epub-section svg {
        background-color: transparent !important;
      }

      /* Highlight styles - monochrome */
      .epub-highlight {
        padding: 0 2px;
        margin: 0 -2px;
        cursor: pointer;
      }

      .epub-highlight-light {
        background-color: rgba(200, 200, 200, 0.4) !important;
      }

      .epub-highlight-medium {
        background-color: rgba(150, 150, 150, 0.5) !important;
      }

      .epub-highlight-dark {
        background-color: rgba(100, 100, 100, 0.6) !important;
      }

      .epub-highlight-solid {
        background-color: rgba(50, 50, 50, 0.7) !important;
        color: white !important;
      }

      /* Legacy color support */
      .epub-highlight-yellow {
        background-color: rgba(200, 200, 200, 0.4) !important;
      }

      .epub-highlight-green {
        background-color: rgba(150, 150, 150, 0.5) !important;
      }

      .epub-highlight-blue {
        background-color: rgba(100, 100, 100, 0.6) !important;
      }

      .epub-highlight-red {
        background-color: rgba(50, 50, 50, 0.7) !important;
      }
    `;

    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [settings, getThemeColors]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply existing highlights to content when highlights change
  useEffect(() => {
    if (highlights.length === 0 || sections.length === 0) return;

    // Apply each highlight to its section
    highlights.forEach((highlight) => {
      const sectionEl = sectionRefs.current.get(highlight.cfi_range);
      if (!sectionEl) return;

      // Search for the highlighted text in the section
      const walker = document.createTreeWalker(
        sectionEl,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const text = node.textContent || '';
        const index = text.indexOf(highlight.text);

        if (index !== -1) {
          // Check if this text is already highlighted
          if (node.parentElement?.classList.contains('epub-highlight')) {
            continue;
          }

          try {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + highlight.text.length);

            const span = document.createElement('span');
            span.className = `epub-highlight epub-highlight-${highlight.color || 'yellow'}`;
            span.dataset.highlightId = highlight.id;
            span.dataset.highlightColor = highlight.color || 'yellow';
            range.surroundContents(span);
            break; // Only highlight the first occurrence
          } catch {
            // If range fails, skip this highlight
          }
        }
      }
    });
  }, [highlights, sections]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null);
      setShowHighlightPopup(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const text = sel.toString().trim();

    // Find which section this selection is in
    let sectionId = '';
    let node: Node | null = range.commonAncestorContainer;
    while (node) {
      if (node instanceof HTMLElement && node.dataset.section) {
        sectionId = node.dataset.section;
        break;
      }
      node = node.parentNode;
    }

    if (text && sectionId) {
      const rect = range.getBoundingClientRect();
      setSelection({ text, sectionId, range: range.cloneRange(), rect });
      setShowHighlightPopup(true);
    }
  }, []);

  // Create highlight from selection
  const handleCreateHighlight = useCallback(async (color: string) => {
    if (!selection) return;

    // Add to store
    await addHighlight(book.id, selection.sectionId, selection.text, color);

    // Wrap the selected text with highlight span
    try {
      const span = document.createElement('span');
      span.className = `epub-highlight epub-highlight-${color}`;
      span.dataset.highlightColor = color;
      selection.range.surroundContents(span);
    } catch {
      // If surroundContents fails (crosses element boundaries), use alternative approach
      console.warn('Could not wrap selection, highlight saved but not visually applied');
    }

    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    setShowHighlightPopup(false);
  }, [selection, book.id, addHighlight]);

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

            // Process images - load from EPUB and convert to blob URLs
            const images = doc.body.querySelectorAll('img');
            for (const img of images) {
              const src = img.getAttribute('src');
              if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                try {
                  // Resolve the image path relative to the section
                  const resolvedPath = section.resolveHref?.(src) || src;
                  // Load the image blob from the EPUB
                  const imageBlob = await foliate.loadBlob(resolvedPath);
                  if (imageBlob) {
                    const blobUrl = URL.createObjectURL(imageBlob);
                    blobUrlsRef.current.push(blobUrl); // Track for cleanup
                    img.setAttribute('src', blobUrl);
                    img.setAttribute('data-original-src', src);
                  }
                } catch (imgErr) {
                  console.warn(`Failed to load image ${src}:`, imgErr);
                  // Keep the original src, it might still work
                }
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

        // Initialize currentSection to first section so bookmarking works immediately
        if (loadedSections.length > 0) {
          setCurrentSection(loadedSections[0].id);
        }

        // Load bookmarks and highlights
        await Promise.all([
          loadBookmarks(book.id),
          loadHighlights(book.id),
        ]);

        // Load saved progress
        const savedProgress = await loadProgress(book.id);

        setIsLoading(false);

        // Scroll to saved position and update currentSection
        if (savedProgress?.current_location) {
          setCurrentSection(savedProgress.current_location);
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
      // Cleanup blob URLs to prevent memory leaks
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
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

  // Get theme colors
  const themeColors = getThemeColors();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="close" size={24} className="text-[var(--text-secondary)]" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] fs-h-sm uppercase mb-2">Error Loading Book</h2>
          <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: themeColors.background, color: themeColors.color }}
      onMouseUp={handleTextSelection}
    >
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

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: themeColors.background }}>
          <div className="flex flex-col items-center gap-4 p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="animate-spin">
              <PixelIcon name="loading" size={24} />
            </div>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide">
              {loadingStatus}
            </p>
          </div>
        </div>
      )}

      {/* Highlight popup - monochrome intensity options */}
      {showHighlightPopup && selection && (
        <div
          className="fixed z-50 flex gap-0 border border-[var(--border-primary)] bg-[var(--bg-primary)]"
          style={{
            left: Math.min(selection.rect.left + selection.rect.width / 2 - 100, window.innerWidth - 220),
            top: selection.rect.top - 44 + window.scrollY,
          }}
        >
          <button
            onClick={() => handleCreateHighlight('light')}
            className="w-10 h-10 bg-[var(--gray-200)] hover:opacity-80 transition-opacity flex items-center justify-center font-[family-name:var(--font-mono)] fs-p-sm text-black border-r border-[var(--border-primary)]"
            title="Light highlight"
          >
            25%
          </button>
          <button
            onClick={() => handleCreateHighlight('medium')}
            className="w-10 h-10 bg-[var(--gray-400)] hover:opacity-80 transition-opacity flex items-center justify-center font-[family-name:var(--font-mono)] fs-p-sm text-black border-r border-[var(--border-primary)]"
            title="Medium highlight"
          >
            50%
          </button>
          <button
            onClick={() => handleCreateHighlight('dark')}
            className="w-10 h-10 bg-[var(--gray-600)] hover:opacity-80 transition-opacity flex items-center justify-center font-[family-name:var(--font-mono)] fs-p-sm text-white border-r border-[var(--border-primary)]"
            title="Dark highlight"
          >
            75%
          </button>
          <button
            onClick={() => handleCreateHighlight('solid')}
            className="w-10 h-10 bg-[var(--gray-800)] hover:opacity-80 transition-opacity flex items-center justify-center font-[family-name:var(--font-mono)] fs-p-sm text-white border-r border-[var(--border-primary)]"
            title="Solid highlight"
          >
            100%
          </button>
          <button
            onClick={() => {
              window.getSelection()?.removeAllRanges();
              setSelection(null);
              setShowHighlightPopup(false);
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]"
            title="Cancel"
          >
            <PixelIcon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Main content - infinite scroll */}
      <div
        ref={contentRef}
        className="pt-[60px] pb-20 mx-auto transition-[width] duration-75"
        style={{ width: `${contentWidth}%` }}
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-1 font-[family-name:var(--font-mono)] fs-p-lg">
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

      {/* Streak */}
      <StreakModal />
      <StreakGoalModal />
      <StreakCelebration />
    </div>
  );
}
