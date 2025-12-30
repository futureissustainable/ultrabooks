'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { StreakDisplay, StreakModal, StreakGoalModal } from '@/components/streak';

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-page py-12 md:py-16">
          {/* Header with Streak */}
          <div className="mb-10 pb-6 border-b border-[var(--border-primary)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3">
                  Your Collection
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl uppercase">
                  Library
                </h1>
              </div>
              <StreakDisplay variant="full" className="hidden md:block w-72" />
            </div>
          </div>

          {/* Mobile Streak Display */}
          <div className="md:hidden mb-6">
            <StreakDisplay variant="full" />
          </div>

          <LibraryGrid />
        </div>
      </main>

      <Footer />

      {/* Streak Modals */}
      <StreakModal />
      <StreakGoalModal />
    </div>
  );
}
