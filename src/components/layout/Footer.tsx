'use client';

import { PixelIcon } from '@/components/icons/PixelIcon';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="container-page py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[var(--text-primary)] flex items-center justify-center">
              <PixelIcon name="book" size={12} className="text-[var(--bg-primary)]" />
            </div>
            <span className="font-display fs-p-lg uppercase tracking-tight">
              Ultrabooks
            </span>
            <span className="hidden sm:inline text-[var(--border-primary)]">•</span>
            <span className="hidden sm:inline font-ui fs-p-sm text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
              Read Anywhere
            </span>
          </div>

          {/* Formats & Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {['EPUB', 'PDF', 'MOBI'].map((format) => (
                <span
                  key={format}
                  className="font-mono fs-p-sm px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors cursor-default"
                >
                  {format}
                </span>
              ))}
            </div>
            <span className="hidden md:inline text-[var(--border-primary)]">•</span>
            <span className="hidden md:inline font-mono fs-p-sm text-[var(--text-muted)]">
              © {currentYear}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
