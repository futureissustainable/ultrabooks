'use client';

import { clsx } from 'clsx';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, fullWidth, id, options, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'px-3 py-3 fs-p-sm appearance-none cursor-pointer',
            'font-[family-name:var(--font-ui)] uppercase tracking-[0.02em]',
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
            'border border-[var(--border-primary)]',
            'focus:outline-none focus:border-[var(--text-primary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-[100ms]',
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23737373' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center]",
            'pr-8',
            error && 'border-[var(--text-primary)]',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
