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
        <section className="relative border-b border-[var(--border-primary)] overflow-hidden min-h-[560px] md:min-h-[640px] lg:min-h-[720px]">
          {/* Scrolling Book Covers Background */}
          <HeroBooks />

          {/* Hero Content */}
          <div className="container-page py-20 md:py-28 lg:py-36 relative z-10">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6 md:mb-8 reveal reveal-delay-1">
                <div className="w-8 h-8 bg-[var(--text-primary)] flex items-center justify-center">
                  <PixelIcon name="book" size={14} className="text-[var(--bg-primary)]" />
                </div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                  Digital Book Reader
                </p>
              </div>

              {/* Headline */}
              <h1 className="font-display text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] uppercase tracking-tight mb-6 md:mb-8 leading-[0.85] reveal reveal-delay-2">
                <span className="gradient-text">Your Books,</span>
                <br />
                <span className="text-[var(--text-primary)]">Everywhere</span>
              </h1>

              {/* Subheadline */}
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-10 md:mb-14 max-w-lg leading-relaxed reveal reveal-delay-3">
                Upload EPUB, PDF, or MOBI files. Sync your reading progress, bookmarks, and highlights across all your devices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 reveal reveal-delay-4">
                <Link href={user ? '/library' : '/signup'} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto btn-shine">
                    <PixelIcon name="arrow-right" size={14} className="mr-2" />
                    {user ? 'Go to Library' : 'Get Started Free'}
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

              {/* Trust indicators */}
              <div className="flex items-center gap-4 mt-8 md:mt-10 reveal reveal-delay-4">
                <div className="flex items-center gap-2">
                  <PixelIcon name="check" size={12} className="text-[var(--text-secondary)]" />
                  <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">Free forever</span>
                </div>
                <div className="w-px h-3 bg-[var(--border-primary)]" />
                <div className="flex items-center gap-2">
                  <PixelIcon name="lock" size={12} className="text-[var(--text-secondary)]" />
                  <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">Your data, your control</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing-lg">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
              <div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4">
                  Core Features
                </p>
                <h2 className="font-display fs-h-lg md:text-[40px] uppercase leading-[0.9]">
                  Everything You Need
                </h2>
              </div>
              <p className="font-ui fs-p-lg text-[var(--text-tertiary)] max-w-sm">
                A complete reading experience designed for the modern reader
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)] stagger-children">
              <div className="bg-[var(--bg-primary)] p-8 md:p-10 card-interactive group">
                <div className="w-14 h-14 bg-[var(--text-primary)] flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                  <PixelIcon name="globe" size={24} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-ui fs-h-sm uppercase tracking-[0.02em] mb-4">Cross-Device Sync</h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Reading progress, bookmarks, and highlights sync automatically across all devices in real-time.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-8 md:p-10 card-interactive group">
                <div className="w-14 h-14 bg-[var(--text-primary)] flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                  <PixelIcon name="layout" size={24} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-ui fs-h-sm uppercase tracking-[0.02em] mb-4">Custom Reader</h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Adjust fonts, sizes, margins, and themes. Your reading experience, tailored to you.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-8 md:p-10 card-interactive group">
                <div className="w-14 h-14 bg-[var(--text-primary)] flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                  <PixelIcon name="edit" size={24} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-ui fs-h-sm uppercase tracking-[0.02em] mb-4">Highlights & Notes</h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
                  Highlight passages and add notes. All annotations saved and synced automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features Row */}
        <section className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)] stagger-children">
              <div className="bg-[var(--bg-secondary)] p-6 md:p-8 hover:bg-[var(--bg-tertiary)] transition-colors group">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center mb-5 group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="download" size={18} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">Offline Reading</h3>
                <p className="font-ui fs-p-sm text-[var(--text-tertiary)] leading-relaxed">
                  Download books to read without internet connection
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6 md:p-8 hover:bg-[var(--bg-tertiary)] transition-colors group">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center mb-5 group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="fire" size={18} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">Reading Streaks</h3>
                <p className="font-ui fs-p-sm text-[var(--text-tertiary)] leading-relaxed">
                  Build habits with daily goals and streak tracking
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6 md:p-8 hover:bg-[var(--bg-tertiary)] transition-colors group">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center mb-5 group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="users" size={18} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">Book Clubs</h3>
                <p className="font-ui fs-p-sm text-[var(--text-tertiary)] leading-relaxed">
                  Read together with friends, share progress
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6 md:p-8 hover:bg-[var(--bg-tertiary)] transition-colors group">
                <div className="w-10 h-10 border border-[var(--border-primary)] flex items-center justify-center mb-5 group-hover:border-[var(--text-primary)] transition-colors">
                  <PixelIcon name="share" size={18} className="text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-ui fs-p-sm uppercase tracking-[0.05em] mb-2">Share Books</h3>
                <p className="font-ui fs-p-sm text-[var(--text-tertiary)] leading-relaxed">
                  Share books with annotations via secure links
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="container-page">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--border-primary)]">
              <div className="bg-[var(--bg-secondary)] py-10 md:py-14 text-center">
                <p className="font-display text-[32px] md:text-[40px] mb-2">3</p>
                <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">File Formats</p>
              </div>
              <div className="bg-[var(--bg-secondary)] py-10 md:py-14 text-center">
                <p className="font-display text-[32px] md:text-[40px] mb-2">∞</p>
                <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Cloud Storage</p>
              </div>
              <div className="bg-[var(--bg-secondary)] py-10 md:py-14 text-center">
                <p className="font-display text-[32px] md:text-[40px] mb-2">100%</p>
                <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Free</p>
              </div>
              <div className="bg-[var(--bg-secondary)] py-10 md:py-14 text-center">
                <p className="font-display text-[32px] md:text-[40px] mb-2">0</p>
                <p className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Ads</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--bg-primary)]">
          <div className="container-page section-spacing-lg">
            <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-10 md:p-16 text-center">
              <div className="w-16 h-16 bg-[var(--text-primary)] flex items-center justify-center mx-auto mb-8">
                <PixelIcon name="book" size={28} className="text-[var(--bg-primary)]" />
              </div>
              <h2 className="font-display text-[28px] md:text-[36px] uppercase mb-4 leading-[0.95]">
                Start Reading Today
              </h2>
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-10 max-w-md mx-auto leading-relaxed">
                Free to use. No credit card required. Your books, your data, your way.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={user ? '/library' : '/signup'}>
                  <Button size="lg" className="btn-shine">
                    <PixelIcon name="arrow-right" size={14} className="mr-2" />
                    {user ? 'Open Library' : 'Create Free Account'}
                  </Button>
                </Link>
                {!user && (
                  <Link href="/login">
                    <Button variant="secondary" size="lg">
                      I have an account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
