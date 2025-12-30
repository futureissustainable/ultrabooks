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
          // Base styles - Brutalist
          'inline-flex items-center justify-center',
          'font-[family-name:var(--font-ui)]',
          'uppercase tracking-[0.05em]',
          'border border-[var(--border-primary)]',
          'transition-all duration-[50ms]',
          'focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:translate-x-[1px] active:translate-y-[1px]',
          // Variant styles
          {
            // Primary - Inverted
            'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]':
              variant === 'primary' && !disabled,
            'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]':
              variant === 'primary' && disabled,
            // Secondary - Outlined
            'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:border-[var(--text-primary)]':
              variant === 'secondary' && !disabled,
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]':
              variant === 'secondary' && disabled,
            // Ghost - Transparent
            'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]':
              variant === 'ghost',
            // Danger - Strong border
            'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]':
              variant === 'danger' && !disabled,
            'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--text-primary)]':
              variant === 'danger' && disabled,
          },
          // Size styles
          {
            'px-2 py-1 text-[10px] gap-1': size === 'sm',
            'px-4 py-2 text-[11px] gap-2': size === 'md',
            'px-6 py-3 text-[12px] gap-2': size === 'lg',
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
