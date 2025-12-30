'use client';

import { clsx } from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          className={clsx(
            'px-3 py-3 fs-p-lg',
            'font-[family-name:var(--font-mono)]',
            'bg-[var(--bg-primary)] text-[var(--text-primary)]',
            'border border-[var(--border-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)]',
            'transition-all duration-100',
            'caret-[var(--text-primary)]',
            error && 'border-[var(--text-primary)]',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && (
          <span
            id={errorId}
            role="alert"
            className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
