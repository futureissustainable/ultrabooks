import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Book Clubs - Read Together with Friends',
  description: 'Join book clubs on MEMOROS to read together with friends. Share books, annotations, and discuss your favorite reads.',
  path: '/clubs',
  noIndex: true, // Coming soon page
});

export default function ClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
