'use client';

import { clsx } from 'clsx';
import { useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal - OS Window Style */}
      <div
        className={clsx(
          'relative z-10 bg-[var(--bg-window)]',
          'border border-[var(--border-primary)]',
          'shadow-[8px_8px_0_rgba(0,0,0,0.5)]',
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
        {/* Window Titlebar */}
        {title && (
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-titlebar)] border-b border-[var(--border-primary)]">
            <span className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              {title}
            </span>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:border-[var(--text-primary)] transition-all duration-[50ms] font-mono fs-p-sm"
              aria-label="Close modal"
            >
              x
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
