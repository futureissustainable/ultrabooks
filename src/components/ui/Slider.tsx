'use client';

import { clsx } from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  fullWidth?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, fullWidth, id, value, ...props }, ref) => {
    const sliderId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full')}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={sliderId}
                className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.05em] text-[var(--text-secondary)]"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span className="font-[family-name:var(--font-ui)] text-[11px] text-[var(--text-primary)]">
                {value}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          value={value}
          className={clsx(
            'appearance-none h-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:bg-[var(--text-primary)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--border-strong)]',
            '[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing',
            '[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:bg-[var(--text-primary)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--border-strong)]',
            '[&::-moz-range-thumb]:cursor-grab',
            'focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-0',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
