import Link from 'next/link';
import { Button } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-[var(--border-primary)]">
          <div className="container-page py-20 md:py-32 lg:py-40">
            <div className="max-w-3xl">
              <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-6">
                Digital Book Reader
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight mb-8 leading-[0.9]">
                Your Books,
                <br />
                Everywhere
              </h1>
              <p className="font-[family-name:var(--font-system)] text-base text-[var(--text-secondary)] mb-12 max-w-md leading-relaxed">
                Upload EPUB, PDF, or MOBI files. Sync your reading progress, bookmarks, and highlights across all your devices.
              </p>
              <div className="flex flex-wrap gap-2">
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
        <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
          <div className="container-page section-spacing-lg">
            <div className="mb-16">
              <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-4">
                Features
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl uppercase">
                Everything You Need
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-[1px] bg-[var(--border-primary)] border border-[var(--border-primary)]">
              <div className="bg-[var(--bg-primary)] p-8">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"></path>
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] uppercase tracking-[0.05em] mb-3">Cross-Device Sync</h3>
                <p className="font-[family-name:var(--font-system)] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Reading progress, bookmarks, and highlights sync automatically across all devices in real-time.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-8">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                    <rect x="3" y="3" width="18" height="18"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] uppercase tracking-[0.05em] mb-3">Custom Reader</h3>
                <p className="font-[family-name:var(--font-system)] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Adjust fonts, sizes, margins, and themes. Your reading experience, tailored to you.
                </p>
              </div>

              <div className="bg-[var(--bg-primary)] p-8">
                <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-secondary)]">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] uppercase tracking-[0.05em] mb-3">Highlights & Notes</h3>
                <p className="font-[family-name:var(--font-system)] text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Highlight passages and add notes. All annotations saved and synced automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--text-primary)] text-[var(--bg-primary)]">
          <div className="container-page section-spacing-lg">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl uppercase mb-6">
                Start Reading Today
              </h2>
              <p className="font-[family-name:var(--font-system)] text-base opacity-70 mb-10 max-w-md leading-relaxed">
                Create a free account and upload your first book in seconds.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--bg-primary)] hover:bg-transparent hover:text-[var(--bg-primary)]">
                  Create Account
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
