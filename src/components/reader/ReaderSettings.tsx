'use client';

import { useReaderStore } from '@/lib/stores/reader-store';
import { Modal } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

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
    // Debounced sync to server
    syncSettings();
  };

  const fontOptions = [
    { value: 'Georgia', label: 'Georgia', style: 'serif' },
    { value: 'Times New Roman', label: 'Times New Roman', style: 'serif' },
    { value: 'Arial', label: 'Arial', style: 'sans-serif' },
    { value: 'Verdana', label: 'Verdana', style: 'sans-serif' },
    { value: 'Courier New', label: 'Courier New', style: 'monospace' },
    { value: 'OpenDyslexic', label: 'OpenDyslexic', style: 'accessibility' },
  ];

  const themeColors = {
    light: { bg: '#ffffff', text: '#000000' },
    dark: { bg: '#000000', text: '#ffffff' },
    sepia: { bg: '#f4ecd8', text: '#5b4636' },
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Reader Settings"
      size="md"
    >
      <div className="space-y-6">
        {/* Theme Section */}
        <section>
          <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <PixelIcon name="moon" size={12} />
            Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'sepia'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleChange('theme', theme)}
                className={`
                  relative p-3 border transition-all duration-100
                  ${settings.theme === theme
                    ? 'border-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                    : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                  }
                `}
              >
                <div
                  className="w-full h-8 border border-[var(--border-primary)] mb-2 flex items-center justify-center"
                  style={{
                    backgroundColor: themeColors[theme].bg,
                    color: themeColors[theme].text
                  }}
                >
                  <span className="fs-p-sm font-[family-name:var(--font-reading)]">Aa</span>
                </div>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide block text-center">
                  {theme}
                </span>
                {settings.theme === theme && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--text-primary)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="border-t border-[var(--border-primary)] pt-6">
          <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <PixelIcon name="font" size={12} />
            Typography
          </h3>

          {/* Font Family */}
          <div className="mb-4">
            <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] mb-2 block">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleChange('fontFamily', font.value)}
                  className={`
                    relative px-3 py-2 text-left border transition-all duration-100
                    ${settings.fontFamily === font.value
                      ? 'border-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  <span
                    className="block fs-p-lg truncate"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </span>
                  <span className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)] uppercase">
                    {font.style}
                  </span>
                  {settings.fontFamily === font.value && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--text-primary)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Font Size
              </label>
              <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-secondary)] tabular-nums">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChange('fontSize', Math.max(12, settings.fontSize - 1))}
                className="w-8 h-8 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
              >
                <span className="fs-p-lg font-bold">−</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={12}
                  max={32}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-[var(--text-primary)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--text-primary)]
                    [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
                />
              </div>
              <button
                onClick={() => handleChange('fontSize', Math.min(32, settings.fontSize + 1))}
                className="w-8 h-8 flex items-center justify-center border border-[var(--border-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
              >
                <span className="fs-p-lg font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Line Height
              </label>
              <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-secondary)] tabular-nums">
                {settings.lineHeight.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1.2, 1.5, 1.8, 2.0, 2.5].map((height) => (
                <button
                  key={height}
                  onClick={() => handleChange('lineHeight', height)}
                  className={`
                    flex-1 py-2 border transition-all duration-100 font-[family-name:var(--font-mono)] fs-p-sm
                    ${settings.lineHeight === height
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  {height}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] mb-2 block">
              Text Alignment
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange('textAlign', 'left')}
                className={`
                  flex-1 py-2 border transition-all duration-100 flex items-center justify-center gap-2
                  ${settings.textAlign === 'left'
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                  }
                `}
              >
                {/* Left align icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="2" />
                  <rect x="3" y="9" width="12" height="2" />
                  <rect x="3" y="14" width="18" height="2" />
                  <rect x="3" y="19" width="10" height="2" />
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase">Left</span>
              </button>
              <button
                onClick={() => handleChange('textAlign', 'justify')}
                className={`
                  flex-1 py-2 border transition-all duration-100 flex items-center justify-center gap-2
                  ${settings.textAlign === 'justify'
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                  }
                `}
              >
                {/* Justify icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="2" />
                  <rect x="3" y="9" width="18" height="2" />
                  <rect x="3" y="14" width="18" height="2" />
                  <rect x="3" y="19" width="18" height="2" />
                </svg>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase">Justify</span>
              </button>
            </div>
          </div>
        </section>

        {/* Layout Section */}
        <section className="border-t border-[var(--border-primary)] pt-6">
          <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <PixelIcon name="layout" size={12} />
            Layout
          </h3>

          {/* Page Width */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Page Width
              </label>
              <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-secondary)] tabular-nums">
                {Math.round(settings.contentWidth)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[40, 55, 65, 80, 95].map((width) => (
                <button
                  key={width}
                  onClick={() => handleChange('contentWidth', width)}
                  className={`
                    flex-1 py-2 border transition-all duration-100 font-[family-name:var(--font-mono)] fs-p-sm
                    ${Math.round(settings.contentWidth) === width
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  {width}%
                </button>
              ))}
            </div>
            <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)] mt-2">
              Tip: Drag the edges of the reading area to adjust width
            </p>
          </div>

          {/* Margins */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Margins
              </label>
              <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-secondary)] tabular-nums">
                {settings.margins}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 20, 40, 60, 80].map((margin) => (
                <button
                  key={margin}
                  onClick={() => handleChange('margins', margin)}
                  className={`
                    flex-1 py-2 border transition-all duration-100 font-[family-name:var(--font-mono)] fs-p-sm
                    ${settings.margins === margin
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  {margin}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="border-t border-[var(--border-primary)] pt-6">
          <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <PixelIcon name="book-open" size={12} />
            Preview
          </h3>
          <div
            className="p-4 border border-[var(--border-primary)] transition-all duration-200"
            style={{
              backgroundColor: themeColors[settings.theme].bg,
              color: themeColors[settings.theme].text,
              fontFamily: settings.fontFamily,
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              textAlign: settings.textAlign as 'left' | 'justify',
              paddingLeft: `${Math.min(settings.margins, 40)}px`,
              paddingRight: `${Math.min(settings.margins, 40)}px`,
            }}
          >
            <p className="mb-2">
              The quick brown fox jumps over the lazy dog.
            </p>
            <p>
              Typography matters for comfortable reading. Good settings reduce eye strain and improve comprehension.
            </p>
          </div>
        </section>

        {/* Reset Button */}
        <div className="border-t border-[var(--border-primary)] pt-4">
          <button
            onClick={() => {
              updateSettings({
                theme: 'light',
                fontFamily: 'Georgia',
                fontSize: 18,
                lineHeight: 1.8,
                margins: 40,
                textAlign: 'left',
                contentWidth: 65,
              });
              syncSettings();
            }}
            className="w-full py-2 border border-[var(--border-primary)] font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </Modal>
  );
}
