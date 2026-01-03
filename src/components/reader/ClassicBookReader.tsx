'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import type { ClassicBook } from '@/components/library/BookRow';
import { useReaderStore, useReaderSettingsHydrated } from '@/lib/stores/reader-store';
import { useStreakStore } from '@/lib/stores/streak-store';
import { READER_THEME_COLORS, READER_CONSTANTS, type ReaderTheme } from '@/lib/constants/reader-theme';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderSettings } from './ReaderSettings';
import { TableOfContents } from './TableOfContents';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { StreakCelebration, StreakModal, StreakGoalModal } from '@/components/streak';

interface ClassicBookReaderProps {
  book: ClassicBook;
  fileBlob: Blob;
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

export function ClassicBookReader({ book, fileBlob }: ClassicBookReaderProps) {
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
  const isRestoringProgress = useRef(false);

  // Width control state
  const [isDragging, setIsDragging] = useState(false);
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const {
    settings,
    updateSettings,
    syncSettings,
    loadSettings,
  } = useReaderStore();

  const contentWidth = settings.contentWidth;

  const { startReadingSession, endReadingSession, checkAndUpdateStreak } = useStreakStore();

  const hasHydrated = useReaderSettingsHydrated();

  // Classic book ID for local storage (prefixed to distinguish from regular books)
  const classicStorageKey = `classic-${book.id}`;

  // Track reading session for streak
  useEffect(() => {
    startReadingSession();
    checkAndUpdateStreak();

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
    const theme = (settings.theme as ReaderTheme) || 'light';
    const colors = READER_THEME_COLORS[theme];
    return {
      background: colors.bg,
      color: colors.text,
      linkColor: colors.link,
    };
  }, [settings.theme]);

  // Inject dynamic CSS
  useEffect(() => {
    if (!hasHydrated) return;

    const colors = getThemeColors();

    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.id = 'epub-reader-dynamic-styles';
      document.head.appendChild(styleRef.current);
    }

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
    `;

    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [settings, getThemeColors, hasHydrated]);

  // Load settings on mount
  useEffect(() => {
    if (hasHydrated) {
      loadSettings();
    }
  }, [loadSettings, hasHydrated]);

  // Handle drag to resize
  const handleMouseDown = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragSide(side);
    dragStartX.current = e.clientX;
    dragStartWidth.current = settings.contentWidth;
  }, [settings.contentWidth]);

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

      const clampedWidth = Math.min(Math.max(30, newWidth), 95);
      updateSettings({ contentWidth: clampedWidth });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSide(null);
      syncSettings();
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
  }, [isDragging, dragSide, updateSettings, syncSettings]);

  // Save progress to localStorage for classics
  const saveClassicProgress = useCallback((location: string, percentage: number) => {
    try {
      localStorage.setItem(classicStorageKey, JSON.stringify({
        location,
        percentage,
        lastReadAt: Date.now(),
      }));
    } catch {
      // Ignore storage errors
    }
  }, [classicStorageKey]);

  // Load progress from localStorage
  const loadClassicProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(classicStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, [classicStorageKey]);

  // Track scroll position and save progress
  useEffect(() => {
    if (sections.length === 0) return;

    let saveTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (isRestoringProgress.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(scrollPercent);

      let currentId = sections[0]?.id || '';
      for (const [id, el] of sectionRefs.current.entries()) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= READER_CONSTANTS.SCROLL_THRESHOLD) {
          currentId = id;
        }
      }

      if (currentId !== currentSection) {
        setCurrentSection(currentId);
      }

      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const location = `${currentId}:${Math.round(scrollTop)}:${Math.round(docHeight)}`;
        saveClassicProgress(location, scrollPercent);
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [sections, currentSection, saveClassicProgress]);

  // Initialize reader with the blob
  useEffect(() => {
    let mounted = true;

    const initReader = async () => {
      try {
        setLoadingStatus('Parsing book...');

        const file = new File([fileBlob], book.title, { type: 'application/epub+zip' });

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

        // Load all sections
        const loadedSections: Section[] = [];
        const totalSections = foliate.sections?.length || 0;

        for (let i = 0; i < totalSections; i++) {
          const section = foliate.sections?.[i];
          if (!section) continue;

          setLoadingStatus(`Loading chapter ${i + 1} of ${totalSections}...`);

          try {
            const doc = await section.createDocument();
            if (!doc?.body) continue;

            // Process images
            const images = doc.body.querySelectorAll('img');
            for (const img of images) {
              const src = img.getAttribute('src');
              if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                try {
                  const resolvedPath = section.resolveHref?.(src) || src;
                  const imageBlob = await foliate.loadBlob(resolvedPath);
                  if (imageBlob) {
                    const blobUrl = URL.createObjectURL(imageBlob);
                    blobUrlsRef.current.push(blobUrl);
                    img.setAttribute('src', blobUrl);
                    img.setAttribute('data-original-src', src);
                  }
                } catch {
                  // Image load failed, keep original src
                }
              }
            }

            const html = doc.body.innerHTML;
            if (html.trim()) {
              loadedSections.push({
                id: section.id || `section-${i}`,
                html,
              });
            }
          } catch {
            // Section load failed, skip it
          }
        }

        if (!mounted) return;

        if (loadedSections.length === 0) {
          throw new Error('No content found in book');
        }

        setSections(loadedSections);

        if (loadedSections.length > 0) {
          setCurrentSection(loadedSections[0].id);
        }

        // Load saved progress from localStorage
        const savedProgress = loadClassicProgress();

        setIsLoading(false);

        // Restore scroll position
        if (savedProgress?.location) {
          isRestoringProgress.current = true;

          const parts = savedProgress.location.split(':');
          const sectionId = parts[0];
          const savedScrollY = parts[1] ? parseInt(parts[1], 10) : null;
          const savedDocHeight = parts[2] ? parseInt(parts[2], 10) : null;

          setCurrentSection(sectionId);

          setTimeout(() => {
            if (savedScrollY !== null && savedDocHeight !== null) {
              const currentDocHeight = document.documentElement.scrollHeight - window.innerHeight;

              if (currentDocHeight > 0 && savedDocHeight > 0) {
                const savedPercent = savedScrollY / savedDocHeight;
                const newScrollY = savedPercent * currentDocHeight;
                window.scrollTo({ top: newScrollY, behavior: 'auto' });
              } else {
                window.scrollTo({ top: savedScrollY, behavior: 'auto' });
              }
            } else if (savedProgress.percentage) {
              const docHeight = document.documentElement.scrollHeight - window.innerHeight;
              const scrollY = (savedProgress.percentage / 100) * docHeight;
              window.scrollTo({ top: scrollY, behavior: 'auto' });
            } else {
              const el = sectionRefs.current.get(sectionId);
              if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'start' });
              }
            }

            setTimeout(() => {
              isRestoringProgress.current = false;
            }, 1000);
          }, READER_CONSTANTS.SCROLL_TIMEOUT);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load book');
          setIsLoading(false);
        }
      }
    };

    initReader();

    return () => {
      mounted = false;
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, [fileBlob, book.title, loadClassicProgress]);

  // Navigation
  const handleNavigate = useCallback((href: string) => {
    const parts = href.split(':');
    if (parts.length >= 2) {
      const savedScrollY = parseInt(parts[1], 10);
      const savedDocHeight = parts[2] ? parseInt(parts[2], 10) : null;

      if (!isNaN(savedScrollY)) {
        if (savedDocHeight) {
          const currentDocHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (currentDocHeight > 0 && savedDocHeight > 0) {
            const savedPercent = savedScrollY / savedDocHeight;
            const newScrollY = savedPercent * currentDocHeight;
            window.scrollTo({ top: newScrollY, behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
        return;
      }
    }

    const sectionId = parts[0] || href;
    const el = sectionRefs.current.get(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      for (const [id, element] of sectionRefs.current.entries()) {
        if (id.includes(sectionId) || sectionId.includes(id)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    }
  }, []);

  const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  const themeColors = getThemeColors();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="close" size={24} className="text-[var(--text-secondary)]" />
          </div>
          <h2 className="font-display fs-h-sm uppercase mb-2">Error Loading Book</h2>
          <p className="font-ui fs-p-lg text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: themeColors.background, color: themeColors.color }}
    >
      <ReaderToolbar
        title={book.title}
        progress={progress}
        hideBookmark={true}
      />

      {/* Left drag handle */}
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

      {/* Right drag handle */}
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
            <p className="font-ui fs-p-sm uppercase tracking-wide">
              {loadingStatus}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-1 font-mono fs-p-lg">
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

      {/* Streak */}
      <StreakModal />
      <StreakGoalModal />
      <StreakCelebration />
    </div>
  );
}
