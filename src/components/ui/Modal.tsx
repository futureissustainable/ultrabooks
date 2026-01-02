'use client';

import { clsx } from 'clsx';
import { useEffect, useCallback, ReactNode } from 'react';
import { useScrollLock } from '@/lib/hooks/use-scroll-lock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Use scroll lock with reference counting to prevent conflicts
  useScrollLock(isOpen);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Clean & Minimal */}
      <div
        className={clsx(
          'relative z-10 bg-[var(--bg-primary)]',
          'rounded-2xl',
          'shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
          'max-h-[90vh] overflow-hidden flex flex-col',
          'animate-scale-in',
          {
            'w-full max-w-sm': size === 'sm',
            'w-full max-w-lg': size === 'md',
            'w-full max-w-2xl': size === 'lg',
            'w-[95vw] h-[90vh]': size === 'full',
          }
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <span className="text-base font-medium text-[var(--text-primary)]">
              {title}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
