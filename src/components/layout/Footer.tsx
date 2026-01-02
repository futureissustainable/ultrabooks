'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PixelIcon } from '@/components/icons/PixelIcon';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuthStore();

  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="container-page py-6 sm:py-8 md:py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[var(--text-primary)] flex items-center justify-center">
                <PixelIcon name="book" size={14} className="text-[var(--bg-primary)]" />
              </div>
              <span className="font-display fs-h-sm uppercase tracking-tight">
                MEMOROS
              </span>
            </div>
            <p className="font-ui fs-p-sm text-[var(--text-secondary)] leading-relaxed max-w-[200px]">
              Your personal reading companion. Upload once, read everywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2">
              Product
            </h4>
            <ul className="space-y-0">
              <li>
                <Link
                  href={user ? '/library' : '/signup'}
                  className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2 block"
                >
                  {user ? 'Library' : 'Get Started'}
                </Link>
              </li>
              <li>
                <Link
                  href="/clubs"
                  className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2 block"
                >
                  Book Clubs
                </Link>
              </li>
              <li>
                <span className="font-ui fs-p-sm text-[var(--text-tertiary)] flex items-center gap-1 py-2">
                  Mobile App
                  <span className="text-[10px] px-1 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] uppercase">Soon</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-2">
              Support
            </h4>
            <ul className="space-y-0">
              <li>
                <Link
                  href="/help"
                  className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2 block"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@memoros.app"
                  className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2 block"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/keyboard-shortcuts"
                  className="font-ui fs-p-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 py-2"
                >
                  <PixelIcon name="keyboard" size={12} />
                  Shortcuts
                </Link>
              </li>
            </ul>
          </div>

          {/* Formats */}
          <div>
            <h4 className="font-ui fs-p-sm uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-3">
              Formats
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['EPUB', 'PDF', 'MOBI'].map((format) => (
                <span
                  key={format}
                  className="font-mono text-[11px] px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]"
                >
                  {format}
                </span>
              ))}
            </div>
            <p className="font-ui fs-p-sm text-[var(--text-tertiary)] mt-3">
              Free • No ads • Offline
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6 border-t border-[var(--border-primary)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Copyright */}
          <p className="font-mono fs-p-sm text-[var(--text-muted)] order-2 sm:order-1">
            © {currentYear} Memoros
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Link
              href="/privacy"
              className="font-ui fs-p-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors px-3 py-2"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-ui fs-p-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors px-3 py-2"
            >
              Terms
            </Link>
            <a
              href="https://github.com/memoros"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-2 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="GitHub"
            >
              <PixelIcon name="github" size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
