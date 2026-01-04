'use client';

import Link from 'next/link';
import { Button, ScrollReveal } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { HeroBooks } from '@/components/home/HeroBooks';
import { ClassicsCarousel } from '@/components/home/ClassicsCarousel';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header variant="landing" />

      <main className="flex-1">
        {/* ============================================
            SECTION 1: HERO
            ============================================ */}
        <section className="relative border-b border-[var(--border-primary)] overflow-hidden h-[calc(100svh-60px)] min-h-[500px] md:min-h-[640px] lg:min-h-[720px] md:h-auto">
          <HeroBooks />

          <div className="container-page relative z-10 h-full flex items-center py-12 md:py-28 lg:py-36">
            <div className="max-w-2xl">
              {/* Eyebrow - SEO optimized */}
              <div className="flex items-center gap-2 mb-5 md:mb-8 reveal reveal-delay-1">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-[var(--text-primary)] flex items-center justify-center">
                  <PixelIcon name="book" size={12} className="text-[var(--bg-primary)]" />
                </div>
                <p className="font-ui fs-p-sm uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  Best Free Ebook Reader App
                </p>
              </div>

              {/* Headline - Optimized for "book app" and "epub reading app" keywords */}
              <h1 className="font-display text-[36px] sm:text-[44px] md:text-[56px] lg:text-[64px] uppercase tracking-tight mb-5 md:mb-8 leading-[0.9] reveal reveal-delay-2">
                <span className="gradient-text">Read EPUB, PDF</span>
                <br />
                <span className="text-[var(--text-primary)]">& MOBI Books</span>
              </h1>

              {/* Subheadline - SEO optimized */}
              <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-8 md:mb-12 max-w-md leading-relaxed reveal reveal-delay-3">
                The best free ebook reader app. Upload your books once, read anywhere. Sync your reading progress, bookmarks, and highlights across all devices.
              </p>

              {/* CTA Buttons - always inline */}
              <div className="flex flex-row gap-3 reveal reveal-delay-4">
                <Link href={user ? '/library' : '/signup'}>
                  <Button size="md" className="btn-shine">
                    <PixelIcon name="arrow-right" size={12} className="mr-2" />
                    {user ? 'Library' : 'Get Started'}
                  </Button>
                </Link>
                {!user && (
                  <Link href="/login">
                    <Button variant="secondary" size="md">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 2: FEATURES / ADVANTAGES
            Psychologically enhanced - focus on benefits
            ============================================ */}
        <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing-lg">
            {/* Section Header - SEO optimized */}
            <ScrollReveal className="text-center mb-12 md:mb-16">
              <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4">
                Why readers choose this book app
              </p>
              <h2 className="font-display fs-h-lg md:text-[40px] uppercase leading-[0.9]">
                The Best EPUB Reader Experience
              </h2>
            </ScrollReveal>

            {/* Feature Cards - Psychological triggers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Cross-device sync feature */}
              <ScrollReveal delay={0} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PixelIcon name="sync" size={28} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-display fs-h-sm uppercase tracking-tight mb-3">
                  Sync Across All Devices
                </h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  Read on your phone, tablet, or computer. Your reading progress, bookmarks, and highlights sync automatically.
                </p>
              </ScrollReveal>

              {/* Multi-format support */}
              <ScrollReveal delay={40} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PixelIcon name="font" size={28} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-display fs-h-sm uppercase tracking-tight mb-3">
                  Read Any Ebook Format
                </h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  Open EPUB, PDF, and MOBI files. Customize fonts, sizes, themes, and margins for your perfect reading experience.
                </p>
              </ScrollReveal>

              {/* Free classic books */}
              <ScrollReveal delay={80} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PixelIcon name="users" size={28} className="text-[var(--bg-primary)]" />
                </div>
                <h3 className="font-display fs-h-sm uppercase tracking-tight mb-3">
                  Free Classic Books
                </h3>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  Access 30+ classic books for free. Dostoevsky, Tolstoy, Kafka, Austen, and more—beautifully formatted.
                </p>
              </ScrollReveal>
            </div>

            {/* Trust signals row */}
            <ScrollReveal delay={120} className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mt-12 md:mt-16 pt-8 border-t border-[var(--border-primary)]">
              <div className="flex items-center gap-2">
                <PixelIcon name="check" size={14} className="text-[var(--accent-primary)]" />
                <span className="font-ui fs-p-sm text-[var(--text-secondary)]">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <PixelIcon name="check" size={14} className="text-[var(--accent-primary)]" />
                <span className="font-ui fs-p-sm text-[var(--text-secondary)]">No ads, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <PixelIcon name="check" size={14} className="text-[var(--accent-primary)]" />
                <span className="font-ui fs-p-sm text-[var(--text-secondary)]">Your data stays yours</span>
              </div>
              <div className="flex items-center gap-2">
                <PixelIcon name="check" size={14} className="text-[var(--accent-primary)]" />
                <span className="font-ui fs-p-sm text-[var(--text-secondary)]">Works offline</span>
              </div>
            </ScrollReveal>

            {/* Social proof - User activity indicator */}
            <ScrollReveal delay={160} className="flex justify-center mt-8">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-full">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--text-tertiary)] border-2 border-[var(--bg-primary)]" />
                  <div className="w-6 h-6 rounded-full bg-[var(--text-secondary)] border-2 border-[var(--bg-primary)]" />
                  <div className="w-6 h-6 rounded-full bg-[var(--text-primary)] border-2 border-[var(--bg-primary)]" />
                </div>
                <span className="font-ui fs-p-sm text-[var(--text-tertiary)]">
                  Join readers worldwide
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================
            SECTION 3: CLASSICS CAROUSEL
            "No books yet? Start with the classics!"
            ============================================ */}
        <section className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] py-16 md:py-24">
          <ScrollReveal className="text-center mb-8 md:mb-12">
            <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-3">
              Free ebooks to read online
            </p>
            <h2 className="font-display fs-h-sm md:fs-h-lg uppercase tracking-tight">
              Read Classic Books Free
            </h2>
            <p className="font-ui fs-p-lg text-[var(--text-secondary)] mt-3 max-w-md mx-auto">
              Explore timeless literature from Dostoevsky, Tolstoy, Kafka, and more. All free, beautifully formatted EPUB files.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={40}>
            <ClassicsCarousel />
          </ScrollReveal>

          <ScrollReveal delay={80} className="text-center mt-8">
            <Link href={user ? '/library' : '/signup'}>
              <Button variant="secondary" size="md">
                <PixelIcon name="book-open" size={14} className="mr-2" />
                Browse All Classics
              </Button>
            </Link>
          </ScrollReveal>
        </section>

        {/* ============================================
            SECTION 4: SIGN UP CTA
            Clear, compelling, minimal
            ============================================ */}
        <section className="bg-[var(--bg-secondary)]">
          <div className="container-page section-spacing-lg">
            <div className="max-w-2xl mx-auto text-center">
              <ScrollReveal>
                <div className="w-20 h-20 bg-[var(--text-primary)] rounded-[5px] flex items-center justify-center mx-auto mb-8">
                  <PixelIcon name="book" size={36} className="text-[var(--bg-primary)]" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={40}>
                <h2 className="font-display text-[32px] md:text-[44px] uppercase mb-5 leading-[0.9]">
                  {user ? 'Welcome Back' : 'Get the Best Free Ebook Reader'}
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <p className="font-ui fs-p-lg text-[var(--text-secondary)] mb-10 max-w-md mx-auto leading-relaxed">
                  {user
                    ? 'Your ebook library is waiting. Pick up where you left off.'
                    : 'Join thousands of readers using MEMOROS. Read EPUB, PDF, and MOBI files for free. No credit card required.'}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <Link href={user ? '/library' : '/signup'}>
                  <Button size="lg" className="btn-shine px-10">
                    <PixelIcon name="arrow-right" size={14} className="mr-2" />
                    {user ? 'Open Library' : 'Create Free Account'}
                  </Button>
                </Link>

                {!user && (
                  <p className="font-ui fs-p-sm text-[var(--text-tertiary)] mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline transition-colors">
                      Sign in
                    </Link>
                  </p>
                )}
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================
          SECTION 5: FOOTER
          ============================================ */}
      <Footer />
    </div>
  );
}
