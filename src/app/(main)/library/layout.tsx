import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'My Library - Your Personal Ebook Collection',
  description: 'Access your personal ebook library. Read EPUB, PDF, and MOBI files with bookmarks, highlights, and reading progress sync across all devices.',
  path: '/library',
  noIndex: true, // Private user content
});

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
