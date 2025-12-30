'use client';

import { clsx } from 'clsx';

interface PixelIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

type IconName =
  | 'book'
  | 'book-open'
  | 'bookmark'
  | 'bookmark-filled'
  | 'highlight'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'search'
  | 'upload'
  | 'download'
  | 'trash'
  | 'edit'
  | 'check'
  | 'plus'
  | 'minus'
  | 'user'
  | 'logout'
  | 'home'
  | 'library'
  | 'file-pdf'
  | 'file-epub'
  | 'file-mobi'
  | 'font'
  | 'text-size'
  | 'layout'
  | 'sync'
  | 'loading'
  | 'fire'
  | 'trophy'
  | 'calendar'
  | 'clock';

const icons: Record<IconName, string> = {
  'book': `M4 2h12v20H4V2zm2 2v16h8V4H6zm2 2h4v2H8V6zm0 4h4v2H8v-2z`,
  'book-open': `M2 4h8v16H2V4zm12 0h8v16h-8V4zM4 6v12h4V6H4zm10 0v12h4V6h-4zM6 8h2v2H6V8zm10 0h2v2h-2V8z`,
  'bookmark': `M6 2h12v20l-6-4-6 4V2zm2 2v14l4-2.67L16 18V4H8z`,
  'bookmark-filled': `M6 2h12v20l-6-4-6 4V2z`,
  'highlight': `M4 4h16v4H4V4zm2 6h12v2H6v-2zm0 4h10v2H6v-2zm0 4h8v2H6v-2z`,
  'settings': `M10 2h4v2h2v2h2v4h-2v2h-2v2h2v2h2v4h-2v2h-2v2h-4v-2H8v-2H6v-4h2v-2h2v-2H8v-2H6V6h2V4h2V2zm2 6a4 4 0 100 8 4 4 0 000-8z`,
  'sun': `M11 0h2v4h-2V0zm0 20h2v4h-2v-4zM0 11h4v2H0v-2zm20 0h4v2h-2v-2zM4 4h2v2H4V4zm14 0h2v2h-2V4zM4 18h2v2H4v-2zm14 0h2v2h-2v-2zm-6-10a4 4 0 100 8 4 4 0 000-8z`,
  'moon': `M12 4a8 8 0 108 8c0-.6-.1-1.2-.2-1.8a6 6 0 01-7.8-7.8c-.6-.3-1.2-.4-2-.4z`,
  'menu': `M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z`,
  'close': `M6 4L4 6l6 6-6 6 2 2 6-6 6 6 2-2-6-6 6-6-2-2-6 6-6-6z`,
  'chevron-left': `M14 4l-8 8 8 8 2-2-6-6 6-6-2-2z`,
  'chevron-right': `M10 4l8 8-8 8-2-2 6-6-6-6 2-2z`,
  'chevron-up': `M4 14l8-8 8 8-2 2-6-6-6 6-2-2z`,
  'chevron-down': `M4 10l8 8 8-8-2-2-6 6-6-6-2 2z`,
  'search': `M10 2a8 8 0 105.3 14.7l4 4 1.4-1.4-4-4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z`,
  'upload': `M11 4h2v10h-2V4zM7 8l5-5 5 5h-3v6h-4V8H7zm-3 8h16v2H4v-2z`,
  'download': `M11 4h2v10h-2V4zm-4 6l5 5 5-5h-3V4h-4v6H7zm-3 8h16v2H4v-2z`,
  'trash': `M8 2h8v2h4v2H4V4h4V2zM6 8h12v14H6V8zm2 2v10h2V10H8zm4 0v10h2V10h-2z`,
  'edit': `M16 2l4 4-12 12H4v-4L16 2zm-2 6l-8 8v2h2l8-8-2-2z`,
  'check': `M4 12l2-2 4 4 8-8 2 2-10 10-6-6z`,
  'plus': `M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z`,
  'minus': `M4 11h16v2H4v-2z`,
  'user': `M12 4a4 4 0 100 8 4 4 0 000-8zM6 16c0-2 2-4 6-4s6 2 6 4v4H6v-4z`,
  'logout': `M4 2h10v2H6v16h8v2H4V2zm12 6l4 4-4 4v-3h-6v-2h6V8z`,
  'home': `M12 2L2 10h3v10h6v-6h2v6h6V10h3L12 2zm0 4l6 5v9h-2v-6H8v6H6v-9l6-5z`,
  'library': `M2 4h6v16H2V4zm8 2h6v14h-6V6zm8-2h6v16h-6V4zM4 6v12h2V6H4zm8 4v10h2V10h-2zm8-4v12h2V6h-2z`,
  'file-pdf': `M4 2h10l6 6v14H4V2zm10 2v4h4l-4-4zM8 12h2v6H8v-6zm3 0h2c1 0 2 1 2 2s-1 2-2 2h-1v2h-1v-6zm1 3h1v-2h-1v2zm4-3h2c1 0 2 1 2 2v2c0 1-1 2-2 2h-2v-6zm1 5h1v-4h-1v4z`,
  'file-epub': `M4 2h10l6 6v14H4V2zm10 2v4h4l-4-4zM8 12h4v1H9v1h2v1H9v2h3v1H8v-6zm5 0h2v5h1v1h-3v-1h1v-4h-1v-1z`,
  'file-mobi': `M4 2h10l6 6v14H4V2zm10 2v4h4l-4-4zM7 12h1l1 3 1-3h1v6h-1v-4l-1 2-1-2v4H7v-6zm5 0h3v1h-1v4h1v1h-3v-1h1v-4h-1v-1z`,
  'font': `M6 4h12v4h-2V6h-3v12h2v2H9v-2h2V6H8v2H6V4z`,
  'text-size': `M4 4h8v2H9v10h2v2H5v-2h2V6H4V4zm10 4h8v2h-2v8h2v2h-6v-2h2v-8h-2V8z`,
  'layout': `M2 2h20v20H2V2zm2 2v16h16V4H4zm2 2h5v5H6V6zm7 0h5v5h-5V6zM6 13h5v5H6v-5zm7 0h5v5h-5v-5z`,
  'sync': `M12 2v4l4-2-4-2zm0 16v4l4-2-4-2zM6 6l2 4 4-2-4-2H6zm10 8l2 4h2l-4-2v-2zM4 12a8 8 0 0114-5.3l-1.4 1.4A6 6 0 006 12H4zm16 0a8 8 0 01-14 5.3l1.4-1.4A6 6 0 0018 12h2z`,
  'loading': `M12 2v4h-2V2h2zm0 16v4h-2v-4h2zM2 10h4v2H2v-2zm16 0h4v2h-4v-2zM5.6 4.2l2.8 2.8-1.4 1.4-2.8-2.8 1.4-1.4zm9.9 9.9l2.8 2.8-1.4 1.4-2.8-2.8 1.4-1.4zM4.2 18.4l2.8-2.8 1.4 1.4-2.8 2.8-1.4-1.4zm14.2-9.9l-2.8 2.8-1.4-1.4 2.8-2.8 1.4 1.4z`,
  'fire': `M12 2c-1 3-3 5-3 8a5 5 0 0010 0c0-3-2-5-3-8-1 2-2.5 3-2.5 5s1 3 2.5 3a3 3 0 01-3-3c0-2-1-3-1-5z M9 14a3 3 0 006 0c0-1.5-1.5-3-3-5-1.5 2-3 3.5-3 5z`,
  'trophy': `M6 2h12v4h2v4c0 2-1 3-2 4v2h-2v2h2v2h2v2H6v-2h2v-2h2v-2H8v-2c-1-1-2-2-2-4V6h2V2zm2 2v2h8V4H8zm-2 4v2c0 1 .5 2 1 2h10c.5 0 1-1 1-2V8h-2v2H8V8H6z`,
  'calendar': `M6 2h2v2h8V2h2v2h2v18H4V4h2V2zm-2 6v12h16V8H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 14h2v2H6v-2zm4 0h2v2h-2v-2z`,
  'clock': `M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm-1 2v7h5v-2h-3V6h-2z`,
};

export function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  const path = icons[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx('inline-block', className)}
      style={{ imageRendering: 'pixelated' }}
    >
      <path d={path} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

export type { IconName };
