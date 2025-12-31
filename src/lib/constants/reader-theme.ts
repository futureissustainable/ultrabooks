/**
 * Shared reader theme constants
 * Used across EpubReader, PdfReader, and ReaderSettings
 */

export const READER_THEME_COLORS = {
  light: {
    bg: '#ffffff',
    text: '#000000',
    link: '#dc2626',
  },
  dark: {
    bg: '#000000',
    text: '#ffffff',
    link: '#ef4444',
  },
  sepia: {
    bg: '#f4ecd8',
    text: '#5b4636',
    link: '#b91c1c',
  },
} as const;

export type ReaderTheme = keyof typeof READER_THEME_COLORS;

export const DEFAULT_READER_SETTINGS = {
  theme: 'light' as ReaderTheme,
  fontFamily: 'Georgia',
  fontSize: 18,
  lineHeight: 1.8,
  margins: 40,
  textAlign: 'left' as 'left' | 'justify',
  contentWidth: 65,
} as const;

// Magic numbers extracted as named constants
export const READER_CONSTANTS = {
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 32,
  MIN_CONTENT_WIDTH: 30,
  MAX_CONTENT_WIDTH: 95,
  SCROLL_THRESHOLD: 100,
  SCROLL_TIMEOUT: 100,
} as const;
