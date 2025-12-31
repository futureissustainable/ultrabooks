'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { HeroBooks } from '@/components/home/HeroBooks';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Scrolling Books */}
        <section className="relative border-b border-[var(--border-primary)] overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
          {/* Scrolling Book Covers Background */}
          <HeroBooks />

          {/* Hero Content */}
          <div className="container-page py-16 md:py-24 lg:py-32 relative z-10">
            <div className="max-w-2xl">
              <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-4 md:mb-6 reveal reveal-delay-1">
                Digital Book Reader
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-[28px] sm:text-[36px] md:fs-h-xl lg:fs-h-xl uppercase tracking-tight mb-6 md:mb-8 leading-[0.9] reveal reveal-delay-2">
                <span className="gradient-text">Your Books,</span>
                <br />
                Everywhere
              </h1>
              <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] mb-8 md:mb-12 max-w-md leading-relaxed reveal reveal-delay-3">
                Upload EPUB, PDF, or MOBI files. Sync your reading progress, bookmarks, and highlights across all your devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 reveal reveal-delay-4">
                <Link href={user ? '/library' : '/signup'} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto btn-shine">
                    {user ? 'Go to Library' : 'Get Started'}
                  </Button>
                </Link>
                {!user && (
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing-lg">
            <div className="mb-12 md:mb-16">
              <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-4">
                Features
              </p>
              <h2 className="font-[family-name:var(--font-display)] fs-h-lg md:fs-h-lg uppercase">
                Everything You Need
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)] stagger-children">
              <div className="bg-[var(--bg-primary)] p-6 md:p-8 card-interactive">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6 icon-interactive">
                  <PixelIcon name="globe" size={20} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-3">Cross-Device Sync</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Reading progress, bookmarks, and highlights sync automatically across all devices in real-time.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-6 md:p-8 card-interactive">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6 icon-interactive">
                  <PixelIcon name="layout" size={20} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-3">Custom Reader</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Adjust fonts, sizes, margins, and themes. Your reading experience, tailored to you.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-6 md:p-8 card-interactive">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6 icon-interactive">
                  <PixelIcon name="edit" size={20} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-3">Highlights & Notes</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Highlight passages and add notes. All annotations saved and synced automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features Row */}
        <section className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
              <div className="bg-[var(--bg-secondary)] p-6">
                <PixelIcon name="download" size={24} className="text-[var(--text-secondary)] mb-4" />
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-2">Offline Reading</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)]">
                  Download books to read without internet connection
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6">
                <PixelIcon name="fire" size={24} className="text-[var(--text-secondary)] mb-4" />
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-2">Reading Streaks</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)]">
                  Build habits with daily goals and streak tracking
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6">
                <PixelIcon name="users" size={24} className="text-[var(--text-secondary)] mb-4" />
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-2">Book Clubs</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)]">
                  Read together with friends, share progress
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6">
                <PixelIcon name="share" size={24} className="text-[var(--text-secondary)] mb-4" />
                <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] mb-2">Share Books</h3>
                <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)]">
                  Share books with annotations via secure links
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--bg-secondary)]">
          <div className="container-page section-spacing text-center">
            <h2 className="font-[family-name:var(--font-display)] fs-h-lg uppercase mb-4">
              Start Reading Today
            </h2>
            <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Free to use. No credit card required. Your books, your data.
            </p>
            <Link href={user ? '/library' : '/signup'}>
              <Button size="lg">
                {user ? 'Open Library' : 'Create Free Account'}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
