import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shared Book - MEMOROS Ebook Reader',
  description: 'View a shared book on MEMOROS. The best free ebook reader for EPUB, PDF, and MOBI files with bookmarks, highlights, and cross-device sync.',
  keywords: [
    'shared book',
    'ebook share',
    'share books online',
    'epub reader',
    'book sharing app',
    'read books together',
  ],
  openGraph: {
    type: 'article',
    title: 'Shared Book - MEMOROS',
    description: 'Someone shared a book with you on MEMOROS. Create a free account to save it to your library.',
    url: SITE_URL,
    siteName: 'MEMOROS',
    images: [
      {
        url: `${SITE_URL}/og-share.png`,
        width: 1200,
        height: 630,
        alt: 'MEMOROS Book Share',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shared Book - MEMOROS',
    description: 'Someone shared a book with you. Read it for free on MEMOROS.',
    images: [`${SITE_URL}/og-share.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
