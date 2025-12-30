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
  | 'check-circle'
  | 'plus'
  | 'minus'
  | 'user'
  | 'users'
  | 'user-plus'
  | 'logout'
  | 'log-in'
  | 'log-out'
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
  | 'clock'
  | 'globe'
  | 'share'
  | 'alert'
  | 'bell'
  | 'wifi'
  | 'wifi-off'
  | 'mail'
  | 'link'
  | 'external-link'
  | 'message-circle'
  | 'heart'
  | 'star';

const icons: Record<IconName, string> = {
  'book': `M4 2h12v20H4V2zm2 2v16h8V4H6zm2 2h4v2H8V6zm0 4h4v2H8v-2z`,
  'book-open': `M2 4h8v16H2V4zm12 0h8v16h-8V4zM4 6v12h4V6H4zm10 0v12h4V6h-4zM6 8h2v2H6V8zm10 0h2v2h-2V8z`,
  'bookmark': `M6 2h12v20l-6-4-6 4V2zm2 2v14l4-2.67L16 18V4H8z`,
  'bookmark-filled': `M6 2h12v20l-6-4-6 4V2z`,
  'highlight': `M4 4h16v4H4V4zm2 6h12v2H6v-2zm0 4h10v2H6v-2zm0 4h8v2H6v-2z`,
  'settings': `M9 2h6v2h2v2h2v6h-2v2h-2v2h-6v-2H7v-2H5V6h2V4h2V2zm3 4a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z`,
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
  'fire': `M10 2h4v2h2v2h2v4h-2v2h-2v2h2v2h2v4h-2v2H8v-2H6v-4h2v-2h2v-2H8v-2H6V6h2V4h2V2zm2 4h-2v2h2V6zm-2 4h2v2h2v4h-2v2h-2v-2H8v-4h2v-2z`,
  'trophy': `M6 2h12v4h2v4c0 2-1 3-2 4v2h-2v2h2v2h2v2H6v-2h2v-2h2v-2H8v-2c-1-1-2-2-2-4V6h2V2zm2 2v2h8V4H8zm-2 4v2c0 1 .5 2 1 2h10c.5 0 1-1 1-2V8h-2v2H8V8H6z`,
  'calendar': `M6 2h2v2h8V2h2v2h2v18H4V4h2V2zm-2 6v12h16V8H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 14h2v2H6v-2zm4 0h2v2h-2v-2z`,
  'clock': `M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm-1 2v7h5v-2h-3V6h-2z`,
  'globe': `M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 2c-1.5 0-3 3-3 6s1.5 6 3 6 3-3 3-6-1.5-6-3-6zM4 12h4v2H4v-2zm12 0h4v2h-4v-2z`,
  'share': `M18 2a4 4 0 00-3 6.5L9 12l6 3.5A4 4 0 1018 22a4 4 0 00-3-6.5L9 12l6-3.5A4 4 0 0018 2zm0 2a2 2 0 110 4 2 2 0 010-4zM6 10a2 2 0 110 4 2 2 0 010-4zm12 6a2 2 0 110 4 2 2 0 010-4z`,
  'check-circle': `M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm4 5l-5 5-3-3-1.5 1.5L11 17l6.5-6.5L16 9z`,
  'alert': `M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm-1 4h2v6h-2V8zm0 8h2v2h-2v-2z`,
  'users': `M8 4a4 4 0 100 8 4 4 0 000-8zM2 16c0-2 2-4 6-4s6 2 6 4v2H2v-2zm14-8a3 3 0 100 6 3 3 0 000-6zm-2 10c0-.7.2-1.4.5-2h5.5c1.1 0 2 .9 2 2v2h-8v-2z`,
  'user-plus': `M12 4a4 4 0 100 8 4 4 0 000-8zM6 16c0-2 2-4 6-4s6 2 6 4v4H6v-4zm14-6h-2V8h-2v2h-2v2h2v2h2v-2h2v-2z`,
  'log-in': `M12 2h8v20h-8v-2h6V4h-6V2zM8 8l4 4-4 4v-3H2v-2h6V8z`,
  'log-out': `M4 2h8v2H6v16h6v2H4V2zm12 6l4 4-4 4v-3h-6v-2h6V8z`,
  'bell': `M12 2a1 1 0 011 1v1a6 6 0 015 6v4l2 2v1H4v-1l2-2v-4a6 6 0 015-6V3a1 1 0 011-1zM8 18h8a4 4 0 11-8 0z`,
  'wifi': `M12 6c-4.4 0-8 2-10 5l2 2c1.5-2 4.5-4 8-4s6.5 2 8 4l2-2c-2-3-5.6-5-10-5zm0 5c-2.2 0-4 1-5 2.5l2 2c.6-.9 1.7-1.5 3-1.5s2.4.6 3 1.5l2-2c-1-1.5-2.8-2.5-5-2.5zm0 5a2 2 0 100 4 2 2 0 000-4z`,
  'wifi-off': `M2 2l20 20-1.4 1.4L2 3.4 3.4 2zM12 6c-1.4 0-2.7.2-4 .6l2.2 2.2c.6-.1 1.2-.2 1.8-.2 3.5 0 6.5 2 8 4l2-2c-2-3-5.6-5-10-5zm-5.5 6.5l2 2c.6-.5 1.3-.9 2-1.1L8.4 11.3c-.7.4-1.4.8-1.9 1.2zm3.5 3c-.5 0-.9.1-1.3.3l2.3 2.3c.3-.1.6-.1 1-.1.8 0 1.5.3 2 .7l2-2c-1-1-2.4-1.5-4-1.2l-2-.7z`,
  'mail': `M2 4h20v16H2V4zm2 2v12h16V6H4zm1 1l7 5 7-5v2l-7 5-7-5V7z`,
  'link': `M10 6H6a4 4 0 000 8h4v-2H6a2 2 0 010-4h4V6zm4 0h4a4 4 0 010 8h-4v-2h4a2 2 0 000-4h-4V6zM8 11h8v2H8v-2z`,
  'external-link': `M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h5v2H7v10h10v-3h2v5H5V5z`,
  'message-circle': `M12 2a10 10 0 00-9 14.3L2 22l5.7-1A10 10 0 1012 2zm0 2a8 8 0 11-4.6 14.6L4 20l1.4-3.4A8 8 0 0112 4z`,
  'heart': `M12 4.5C10.5 2.5 7 2 5 4.5S3 10 12 19c9-9 9-12 7-14.5S13.5 2.5 12 4.5z`,
  'star': `M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z`,
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
