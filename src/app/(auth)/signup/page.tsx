import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Header } from '@/components/layout/Header';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Create Free Account - Best Ebook Reader App',
  description: 'Create a free MEMOROS account to read EPUB, PDF, and MOBI ebooks. Sync your reading progress, bookmarks, and highlights across all devices. Free forever, no credit card required.',
  path: '/signup',
  keywords: ['free ebook reader', 'create book app account', 'epub reader signup', 'free reading app', 'best free ebook app'],
});

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header variant="landing" />
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md">
          {/* Brand mark */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                <PixelIcon name="book" size={20} className="text-[var(--bg-primary)]" />
              </div>
              <span className="font-display fs-h-sm tracking-tight uppercase">
                MEMOROS
              </span>
            </Link>
          </div>

          <SignupForm />
        </div>
      </main>
    </div>
  );
}
