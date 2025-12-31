'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { StreakDisplay, StreakModal, StreakGoalModal } from '@/components/streak';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-page py-10 md:py-14">
          {/* Header with Streak */}
          <div className="mb-8 md:mb-10 pb-6 border-b border-[var(--border-primary)]">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
                  <PixelIcon name="library" size={24} className="text-[var(--bg-primary)]" />
                </div>
                <div>
                  <p className="font-ui fs-p-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-2">
                    Your Collection
                  </p>
                  <h1 className="font-display text-[28px] md:text-[36px] uppercase leading-[0.9]">
                    Library
                  </h1>
                </div>
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
