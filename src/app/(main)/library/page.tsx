'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LibraryGrid } from '@/components/library/LibraryGrid';

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      <main className="flex-1">
        <div className="container-page py-8">
          <LibraryGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}
