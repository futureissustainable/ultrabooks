import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Reading - MEMOROS Ebook Reader',
  description: 'Read your ebook with MEMOROS. Enjoy a distraction-free reading experience with bookmarks, highlights, and progress sync.',
  path: '/reader',
  noIndex: true, // Private user content
});

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
