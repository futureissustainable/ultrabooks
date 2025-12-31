'use client';

import { clsx } from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <label
      className={clsx(
        'flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative w-8 h-4 border border-[var(--border-primary)] transition-all duration-[100ms]',
          checked ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[var(--bg-tertiary)]'
        )}
      >
        <span
          className={clsx(
            'absolute top-[2px] left-[2px] w-[10px] h-[10px] transition-transform duration-[100ms]',
            checked ? 'translate-x-[14px] bg-[var(--bg-primary)]' : 'bg-[var(--text-secondary)]'
          )}
        />
      </button>
      {label && (
        <span className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)]">
          {label}
        </span>
      )}
    </label>
  );
}
