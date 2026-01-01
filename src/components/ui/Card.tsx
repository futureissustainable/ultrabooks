'use client';

import { clsx } from 'clsx';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-[var(--bg-secondary)]',
          'border border-[var(--border-primary)]',
          'transition-all duration-[50ms]',
          // Variant styles
          {
            '': variant === 'default',
            'shadow-[4px_4px_0_var(--black)]': variant === 'elevated',
            'border-[var(--border-subtle)]': variant === 'outlined',
          },
          // Padding styles
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4': padding === 'md',
            'p-6': padding === 'lg',
            'p-8': padding === 'xl',
          },
          // Hover effect
          hoverable && [
            'cursor-pointer',
            'hover:border-[var(--border-strong)]',
            'hover:bg-[var(--bg-tertiary)]',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
