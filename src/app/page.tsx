import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        {/* Hero Section with dot grid */}
        <section className="relative overflow-hidden">
          {/* Dot grid background with fade */}
          <div className="absolute inset-0 bg-dots-lg" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />

          <div className="container-page py-24 md:py-40 lg:py-48 relative">
            <div className="max-w-4xl">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6">
                Ebook Reader
              </p>
              <h1 className="font-heading leading-[0.9] mb-8">
                Read
                <br />
                <span className="text-[var(--text-secondary)]">Anywhere</span>
              </h1>
              <p className="font-body text-[15px] md:text-[17px] text-[var(--text-secondary)] mb-12 max-w-lg leading-relaxed">
                Upload EPUB, PDF, or MOBI files. Sync progress, bookmarks, and highlights across all your devices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="container-page section-spacing-lg">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3">
                  Features
                </p>
                <h2 className="font-heading">Why Ultrabooks</h2>
              </div>
              <p className="font-body text-[13px] text-[var(--text-secondary)] max-w-sm">
                Built for serious readers who want control without complexity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="elevated" padding="lg" className="hover-lift">
                <div className="w-14 h-14 bg-[var(--bg-inverse)] flex items-center justify-center mb-6">
                  <PixelIcon name="sync" size={28} className="text-[var(--text-inverse)]" />
                </div>
                <h3 className="font-heading text-lg mb-4">Cross-Device Sync</h3>
                <p className="font-body text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Reading progress, bookmarks, and highlights sync automatically across all devices in real-time.
                </p>
              </Card>

              <Card variant="elevated" padding="lg" className="hover-lift">
                <div className="w-14 h-14 bg-[var(--bg-inverse)] flex items-center justify-center mb-6">
                  <PixelIcon name="layout" size={28} className="text-[var(--text-inverse)]" />
                </div>
                <h3 className="font-heading text-lg mb-4">Custom Reader</h3>
                <p className="font-body text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Adjust fonts, sizes, margins, and themes. Your reading experience, your way.
                </p>
              </Card>

              <Card variant="elevated" padding="lg" className="hover-lift">
                <div className="w-14 h-14 bg-[var(--bg-inverse)] flex items-center justify-center mb-6">
                  <PixelIcon name="highlight" size={28} className="text-[var(--text-inverse)]" />
                </div>
                <h3 className="font-heading text-lg mb-4">Highlights & Notes</h3>
                <p className="font-body text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Highlight passages and add notes. All annotations saved and synced automatically.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--bg-inverse)] text-[var(--text-inverse)]">
          <div className="container-page section-spacing-lg">
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--text-inverse)]/60 mb-4">
                Get Started
              </p>
              <h2 className="font-heading mb-8">Start Reading Now</h2>
              <p className="font-body text-[15px] text-[var(--text-inverse)]/70 mb-12 max-w-md mx-auto leading-relaxed">
                Create a free account and upload your first book in seconds.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--bg-primary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
