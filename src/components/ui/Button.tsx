'use client';

import { clsx } from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          // Base styles - Clean & Minimal
          'inline-flex items-center justify-center',
          'font-medium',
          'rounded-lg',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          // Variant styles
          {
            // Primary - Filled
            'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--gray-200)]':
              variant === 'primary' && !disabled,
            'bg-[var(--text-primary)] text-[var(--bg-primary)]':
              variant === 'primary' && disabled,
            // Secondary - Subtle background
            'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]':
              variant === 'secondary' && !disabled,
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]':
              variant === 'secondary' && disabled,
            // Ghost - Transparent
            'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]':
              variant === 'ghost',
            // Danger
            'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-red-500 hover:text-white':
              variant === 'danger' && !disabled,
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]':
              variant === 'danger' && disabled,
          },
          // Size styles
          {
            'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
            'px-4 py-2.5 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2': size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
