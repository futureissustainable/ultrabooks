import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

// Load custom fonts
const mondwest = localFont({
  src: '../../public/fonts/PPMondwest-Regular.otf',
  variable: '--font-mondwest',
  display: 'swap',
});

const neueBit = localFont({
  src: '../../public/fonts/PPNeueBit-Bold.otf',
  variable: '--font-neuebit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ultrabooks',
  description: 'A brutalist ebook reader for EPUB, PDF, and MOBI files. Sync your reading progress, bookmarks, and highlights across all devices.',
  keywords: ['ebook', 'reader', 'epub', 'pdf', 'mobi', 'reading', 'books'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${mondwest.variable} ${neueBit.variable}`}>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
