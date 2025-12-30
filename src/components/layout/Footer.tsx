'use client';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="container-page py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-display)] fs-p-lg uppercase tracking-tight">
            Ultrabooks
          </span>
          <span className="text-[var(--text-tertiary)]">|</span>
          <span className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-tertiary)]">
            Read Anywhere
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] fs-p-sm px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            EPUB
          </span>
          <span className="font-[family-name:var(--font-mono)] fs-p-sm px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            PDF
          </span>
          <span className="font-[family-name:var(--font-mono)] fs-p-sm px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
            MOBI
          </span>
        </div>
      </div>
    </footer>
  );
}
