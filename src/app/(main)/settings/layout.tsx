import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Settings - Customize Your Reading Experience',
  description: 'Customize your MEMOROS reading experience. Adjust fonts, themes, and sync settings for the best ebook reading experience.',
  path: '/settings',
  noIndex: true, // Private user settings
});

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
