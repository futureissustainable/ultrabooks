import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shared Book Collection - MEMOROS Ebook Reader',
  description: 'View a shared book collection on MEMOROS. The best free ebook reader for EPUB, PDF, and MOBI files with bookmarks, highlights, and cross-device sync.',
  keywords: [
    'shared book collection',
    'ebook collection share',
    'share books online',
    'epub reader',
    'book collection app',
    'digital library share',
  ],
  openGraph: {
    type: 'article',
    title: 'Shared Book Collection - MEMOROS',
    description: 'Someone shared a book collection with you on MEMOROS. Create a free account to add them to your library.',
    url: SITE_URL,
    siteName: 'MEMOROS',
    images: [
      {
        url: `${SITE_URL}/og-share.png`,
        width: 1200,
        height: 630,
        alt: 'MEMOROS Collection Share',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shared Book Collection - MEMOROS',
    description: 'Someone shared a book collection with you. Add them to your library for free.',
    images: [`${SITE_URL}/og-share.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CollectionShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
