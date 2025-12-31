import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function ClubsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-6">
            <PixelIcon name="users" size={32} className="text-[var(--text-secondary)]" />
          </div>
          <h1 className="font-display fs-h-lg uppercase leading-[0.9] mb-3">
            Book Clubs
          </h1>
          <p className="font-ui fs-p-lg uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
            Coming Soon
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
