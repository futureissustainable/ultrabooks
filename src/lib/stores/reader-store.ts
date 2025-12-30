import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { Bookmark, Highlight, ReadingProgress, UserSettings } from '@/lib/supabase/types';

interface ReaderSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: number;
  textAlign: 'left' | 'justify';
}

// Local progress storage for each book
interface LocalProgress {
  [bookId: string]: {
    currentLocation: string;
    currentPage: number | null;
    progressPercentage: number;
    lastReadAt: string;
  };
}

interface ReaderState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Settings
  settings: ReaderSettings;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  syncSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;

  // Reading progress - local storage for offline support
  localProgress: LocalProgress;
  currentLocation: string | null;
  currentPage: number | null;
  progressPercentage: number;
  updateProgress: (bookId: string, location: string, page?: number, percentage?: number) => Promise<void>;
  loadProgress: (bookId: string) => Promise<ReadingProgress | null>;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookId: string, location: string, page?: number, title?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  updateBookmarkNote: (id: string, note: string) => Promise<void>;
  loadBookmarks: (bookId: string) => Promise<void>;

  // Highlights
  highlights: Highlight[];
  addHighlight: (bookId: string, cfiRange: string, text: string, color?: string, page?: number) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  updateHighlightNote: (id: string, note: string) => Promise<void>;
  updateHighlightColor: (id: string, color: string) => Promise<void>;
  loadHighlights: (bookId: string) => Promise<void>;

  // UI State
  isTocOpen: boolean;
  isSettingsOpen: boolean;
  isBookmarksOpen: boolean;
  isHighlightsOpen: boolean;
  setTocOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setBookmarksOpen: (open: boolean) => void;
  setHighlightsOpen: (open: boolean) => void;
}

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontFamily: 'Georgia',
  fontSize: 18,
  lineHeight: 1.8,
  margins: 40,
  textAlign: 'left',
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Settings
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      syncSettings: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { settings } = get();
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: settings.theme,
            font_family: settings.fontFamily,
            font_size: settings.fontSize,
            line_height: settings.lineHeight,
            margins: settings.margins,
            text_align: settings.textAlign,
            updated_at: new Date().toISOString(),
          });
      },

      loadSettings: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          // Only update from Supabase if there's actual data
          // This ensures syncing across devices while respecting local persisted settings
          set({
            settings: {
              theme: data.theme || get().settings.theme,
              fontFamily: data.font_family || get().settings.fontFamily,
              fontSize: data.font_size || get().settings.fontSize,
              lineHeight: data.line_height || get().settings.lineHeight,
              margins: data.margins ?? get().settings.margins,
              textAlign: data.text_align || get().settings.textAlign,
            },
          });
        } else {
          // If no Supabase settings exist, sync current local settings to Supabase
          get().syncSettings();
        }
      },

      // Reading progress - local storage for offline support
      localProgress: {},
      currentLocation: null,
      currentPage: null,
      progressPercentage: 0,

      updateProgress: async (bookId, location, page, percentage) => {
        const now = new Date().toISOString();

        // Always save locally first for offline support
        set((state) => ({
          currentLocation: location,
          currentPage: page || null,
          progressPercentage: percentage || 0,
          localProgress: {
            ...state.localProgress,
            [bookId]: {
              currentLocation: location,
              currentPage: page || null,
              progressPercentage: percentage || 0,
              lastReadAt: now,
            },
          },
        }));

        // Then try to sync to Supabase
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase
            .from('reading_progress')
            .upsert({
              user_id: user.id,
              book_id: bookId,
              current_location: location,
              current_page: page,
              progress_percentage: percentage || 0,
              last_read_at: now,
              updated_at: now,
            });
        } catch (error) {
          // Silently fail - local progress is saved
          console.warn('Failed to sync progress to server:', error);
        }
      },

      loadProgress: async (bookId) => {
        // First check local progress (works offline)
        const localData = get().localProgress[bookId];
        if (localData) {
          set({
            currentLocation: localData.currentLocation,
            currentPage: localData.currentPage,
            progressPercentage: localData.progressPercentage,
          });
        }

        // Then try to get from Supabase (may have more recent data from another device)
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // Not logged in, return local data
            return localData ? {
              current_location: localData.currentLocation,
              current_page: localData.currentPage,
              progress_percentage: localData.progressPercentage,
            } as ReadingProgress : null;
          }

          const { data } = await supabase
            .from('reading_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('book_id', bookId)
            .single();

          if (data) {
            // Compare timestamps - use the more recent one
            const serverTime = new Date(data.last_read_at || 0).getTime();
            const localTime = localData ? new Date(localData.lastReadAt).getTime() : 0;

            if (serverTime >= localTime) {
              // Server data is newer, use it
              set({
                currentLocation: data.current_location,
                currentPage: data.current_page,
                progressPercentage: data.progress_percentage,
              });
              return data;
            }
          }

          // Return local data if no server data or local is newer
          return localData ? {
            current_location: localData.currentLocation,
            current_page: localData.currentPage,
            progress_percentage: localData.progressPercentage,
          } as ReadingProgress : data;
        } catch (error) {
          console.warn('Failed to load progress from server:', error);
          // Return local data on error
          return localData ? {
            current_location: localData.currentLocation,
            current_page: localData.currentPage,
            progress_percentage: localData.progressPercentage,
          } as ReadingProgress : null;
        }
      },

      // Bookmarks
      bookmarks: [],

      addBookmark: async (bookId, location, page, title) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            book_id: bookId,
            location,
            page,
            title,
          })
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            bookmarks: [...state.bookmarks, data],
          }));
        }
      },

      removeBookmark: async (id) => {
        const supabase = createClient();
        await supabase.from('bookmarks').delete().eq('id', id);

        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      updateBookmarkNote: async (id, note) => {
        const supabase = createClient();
        await supabase
          .from('bookmarks')
          .update({ note, updated_at: new Date().toISOString() })
          .eq('id', id);

        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, note } : b
          ),
        }));
      },

      loadBookmarks: async (bookId) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .order('created_at', { ascending: false });

        set({ bookmarks: data || [] });
      },

      // Highlights
      highlights: [],

      addHighlight: async (bookId, cfiRange, text, color = 'yellow', page) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('highlights')
          .insert({
            user_id: user.id,
            book_id: bookId,
            cfi_range: cfiRange,
            text,
            color,
            page,
          })
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            highlights: [...state.highlights, data],
          }));
        }
      },

      removeHighlight: async (id) => {
        const supabase = createClient();
        await supabase.from('highlights').delete().eq('id', id);

        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        }));
      },

      updateHighlightNote: async (id, note) => {
        const supabase = createClient();
        await supabase
          .from('highlights')
          .update({ note, updated_at: new Date().toISOString() })
          .eq('id', id);

        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, note } : h
          ),
        }));
      },

      updateHighlightColor: async (id, color) => {
        const supabase = createClient();
        await supabase
          .from('highlights')
          .update({ color, updated_at: new Date().toISOString() })
          .eq('id', id);

        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, color } : h
          ),
        }));
      },

      loadHighlights: async (bookId) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('highlights')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .order('created_at', { ascending: false });

        set({ highlights: data || [] });
      },

      // UI State
      isTocOpen: false,
      isSettingsOpen: false,
      isBookmarksOpen: false,
      isHighlightsOpen: false,

      setTocOpen: (open) => set({ isTocOpen: open }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setBookmarksOpen: (open) => set({ isBookmarksOpen: open }),
      setHighlightsOpen: (open) => set({ isHighlightsOpen: open }),
    }),
    {
      name: 'ultrabooks-reader-settings',
      partialize: (state) => ({
        settings: state.settings,
        localProgress: state.localProgress,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * HYDRATION FIX EXPLANATION:
 * --------------------------
 * The Zustand persist middleware's `onRehydrateStorage` callback can fail to fire
 * in several scenarios:
 * 1. No data exists in localStorage yet (first visit)
 * 2. localStorage is disabled/blocked
 * 3. Race conditions during SSR hydration in Next.js
 * 4. The callback itself throws an error
 *
 * When this happens, `_hasHydrated` never becomes true, and any component
 * waiting for `hasHydrated` before rendering/initializing will be stuck
 * in an infinite loading state.
 *
 * SOLUTION: We use a hybrid approach:
 * 1. `onRehydrateStorage` sets `_hasHydrated` immediately when persist works
 * 2. A client-side fallback sets `_hasHydrated` after 100ms if it's still false
 * 3. Components should use `useReaderSettingsHydrated()` which handles both cases
 *
 * This ensures the app always becomes interactive, even if localStorage fails.
 */

// Fallback: ensure hydration completes even if onRehydrateStorage fails
if (typeof window !== 'undefined') {
  // Small delay to let onRehydrateStorage fire first if it can
  setTimeout(() => {
    if (!useReaderStore.getState()._hasHydrated) {
      console.warn('Zustand hydration fallback triggered - onRehydrateStorage may have failed');
      useReaderStore.setState({ _hasHydrated: true });
    }
  }, 100);
}

// Hook to wait for hydration
export const useReaderSettingsHydrated = () => useReaderStore((state) => state._hasHydrated);
