'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { WelcomeModal, OnboardingChecklist, SuccessCelebration } from '@/components/onboarding';

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-page pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 md:pb-32">
          <LibraryGrid />
        </div>
      </main>

      <Footer />

      {/* Onboarding components */}
      <WelcomeModal />
      <OnboardingChecklist />
      <SuccessCelebration />
    </div>
  );
}
