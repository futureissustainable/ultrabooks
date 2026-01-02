'use client';

import { clsx } from 'clsx';
import { useReaderStore } from '@/lib/stores/reader-store';
import { READER_THEME_COLORS, type ReaderTheme } from '@/lib/constants/reader-theme';
import { Modal } from '@/components/ui';

export function ReaderSettings() {
  const {
    settings,
    updateSettings,
    syncSettings,
    isSettingsOpen,
    setSettingsOpen,
  } = useReaderStore();

  const handleChange = (key: string, value: string | number) => {
    updateSettings({ [key]: value });
    syncSettings();
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Settings"
      size="sm"
    >
      <div className="space-y-8">
        {/* Theme */}
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-4 block">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'sepia'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleChange('theme', theme)}
                className={clsx(
                  'relative p-3 rounded-[5px] transition-all',
                  settings.theme === theme
                    ? 'ring-2 ring-[var(--text-primary)] bg-[var(--bg-secondary)]'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                <div
                  className="w-full h-8 mb-2 flex items-center justify-center rounded-[5px]"
                  style={{
                    backgroundColor: READER_THEME_COLORS[theme].bg,
                    color: READER_THEME_COLORS[theme].text
                  }}
                >
                  <span className="text-sm font-medium">Aa</span>
                </div>
                <span className="text-xs text-center block capitalize">
                  {theme}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-[var(--text-secondary)]">
              Text Size
            </label>
            <span className="text-sm text-[var(--text-muted)] tabular-nums">
              {settings.fontSize}px
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleChange('fontSize', Math.max(12, settings.fontSize - 2))}
              className="w-11 h-11 flex items-center justify-center rounded-[5px] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-lg"
            >
              −
            </button>
            <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full relative">
              <div
                className="h-full bg-[var(--text-primary)] rounded-full transition-all"
                style={{ width: `${((settings.fontSize - 12) / 20) * 100}%` }}
              />
            </div>
            <button
              onClick={() => handleChange('fontSize', Math.min(32, settings.fontSize + 2))}
              className="w-11 h-11 flex items-center justify-center rounded-[5px] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Line Spacing */}
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-4 block">
            Line Spacing
          </label>
          <div className="flex gap-2">
            {[
              { value: 1.4, label: 'Tight' },
              { value: 1.8, label: 'Normal' },
              { value: 2.2, label: 'Relaxed' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange('lineHeight', option.value)}
                className={clsx(
                  'flex-1 py-2.5 rounded-[5px] transition-all text-sm',
                  settings.lineHeight === option.value
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
