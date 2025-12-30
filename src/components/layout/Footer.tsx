'use client';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      {/* Status Bar Style Footer */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-display)] text-sm uppercase tracking-tight">
            Ultrabooks
          </span>
          <span className="text-[var(--border-primary)]">|</span>
          <span className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
            Read Anywhere
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.05em] px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            EPUB
          </span>
          <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.05em] px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            PDF
          </span>
          <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.05em] px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            MOBI
          </span>
        </div>
      </div>
    </footer>
  );
}
