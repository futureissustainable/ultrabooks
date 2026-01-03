'use client';

import { clsx } from 'clsx';
import {
  Book,
  BookOpen,
  Bookmark,
  BookmarkSimple,
  HighlighterCircle,
  Gear,
  Sun,
  Moon,
  List,
  X,
  CaretLeft,
  CaretRight,
  Upload,
  Download,
  Trash,
  Pencil,
  NotePencil,
  Check,
  CheckCircle,
  Plus,
  Minus,
  User,
  Users,
  UserPlus,
  SignIn,
  SignOut,
  Books,
  File,
  TextAa,
  ArrowsClockwise,
  CircleNotch,
  Fire,
  Trophy,
  Clock,
  Share,
  Warning,
  WarningCircle,
  Bell,
  WifiHigh,
  WifiSlash,
  Envelope,
  Cloud,
  ArrowRight,
  Keyboard,
  GithubLogo,
  MagnifyingGlass,
  type IconProps,
} from '@phosphor-icons/react';
import { ComponentType } from 'react';

// Only icons that are actually used in the codebase
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
  | 'upload'
  | 'download'
  | 'trash'
  | 'edit'
  | 'edit-box'
  | 'check'
  | 'check-circle'
  | 'plus'
  | 'minus'
  | 'user'
  | 'users'
  | 'user-plus'
  | 'log-in'
  | 'log-out'
  | 'library'
  | 'file-mobi'
  | 'font'
  | 'sync'
  | 'refresh'
  | 'loading'
  | 'fire'
  | 'trophy'
  | 'clock'
  | 'share'
  | 'alert'
  | 'alert-circle'
  | 'bell'
  | 'wifi'
  | 'wifi-off'
  | 'mail'
  | 'cloud'
  | 'arrow-right'
  | 'keyboard'
  | 'github'
  | 'search';

// Map our icon names to Phosphor components
const iconMap: Record<IconName, ComponentType<IconProps>> = {
  'book': Book,
  'book-open': BookOpen,
  'bookmark': Bookmark,
  'bookmark-filled': BookmarkSimple,
  'highlight': HighlighterCircle,
  'settings': Gear,
  'sun': Sun,
  'moon': Moon,
  'menu': List,
  'close': X,
  'chevron-left': CaretLeft,
  'chevron-right': CaretRight,
  'upload': Upload,
  'download': Download,
  'trash': Trash,
  'edit': Pencil,
  'edit-box': NotePencil,
  'check': Check,
  'check-circle': CheckCircle,
  'plus': Plus,
  'minus': Minus,
  'user': User,
  'users': Users,
  'user-plus': UserPlus,
  'log-in': SignIn,
  'log-out': SignOut,
  'library': Books,
  'file-mobi': File,
  'font': TextAa,
  'sync': ArrowsClockwise,
  'refresh': ArrowsClockwise,
  'loading': CircleNotch,
  'fire': Fire,
  'trophy': Trophy,
  'clock': Clock,
  'share': Share,
  'alert': Warning,
  'alert-circle': WarningCircle,
  'bell': Bell,
  'wifi': WifiHigh,
  'wifi-off': WifiSlash,
  'mail': Envelope,
  'cloud': Cloud,
  'arrow-right': ArrowRight,
  'keyboard': Keyboard,
  'github': GithubLogo,
  'search': MagnifyingGlass,
};

interface PixelIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Use 'fill' weight for filled icons, 'regular' for others
  const weight = name === 'bookmark-filled' ? 'fill' : 'regular';

  return (
    <IconComponent
      size={size}
      weight={weight}
      className={clsx('inline-block', className)}
    />
  );
}

export type { IconName };
