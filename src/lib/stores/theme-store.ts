import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => (() => void) | void;
}

// Store the current media query listener for cleanup
let mediaQueryCleanup: (() => void) | null = null;

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        set({ theme: newTheme, resolvedTheme: newTheme });
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolved);
        set({ resolvedTheme: resolved });

        // Clean up previous listener if exists
        if (mediaQueryCleanup) {
          mediaQueryCleanup();
          mediaQueryCleanup = null;
        }

        // Listen for system theme changes
        if (typeof window !== 'undefined' && theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = (e: MediaQueryListEvent) => {
            const newResolved = e.matches ? 'dark' : 'light';
            applyTheme(newResolved);
            set({ resolvedTheme: newResolved });
          };
          mediaQuery.addEventListener('change', handler);

          // Store cleanup function
          mediaQueryCleanup = () => {
            mediaQuery.removeEventListener('change', handler);
          };

          // Return cleanup function for external use
          return mediaQueryCleanup;
        }
      },
    }),
    {
      name: 'memoros-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
