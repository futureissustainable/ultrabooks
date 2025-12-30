'use client';

import { useReaderStore } from '@/lib/stores/reader-store';
import { Modal, Select, Slider } from '@/components/ui';

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
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Arial', label: 'Arial (Sans)' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New (Mono)' },
    { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'sepia', label: 'Sepia' },
  ];

  const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'justify', label: 'Justify' },
  ];

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Reader Settings"
      size="md"
    >
      <div className="space-y-5">
        {/* Theme */}
        <Select
          label="Theme"
          options={themeOptions}
          value={settings.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
          fullWidth
        />

        {/* Font Family */}
        <Select
          label="Font"
          options={fontOptions}
          value={settings.fontFamily}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          fullWidth
        />

        {/* Font Size */}
        <Slider
          label="Font Size"
          min={12}
          max={32}
          step={1}
          value={settings.fontSize}
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
          showValue
          fullWidth
        />

        {/* Line Height */}
        <Slider
          label="Line Height"
          min={1.2}
          max={2.5}
          step={0.1}
          value={settings.lineHeight}
          onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
          showValue
          fullWidth
        />

        {/* Margins */}
        <Slider
          label="Margins"
          min={0}
          max={100}
          step={5}
          value={settings.margins}
          onChange={(e) => handleChange('margins', Number(e.target.value))}
          showValue
          fullWidth
        />

        {/* Text Alignment */}
        <Select
          label="Text Alignment"
          options={alignOptions}
          value={settings.textAlign}
          onChange={(e) => handleChange('textAlign', e.target.value)}
          fullWidth
        />

        {/* Preview */}
        <div className="border-t border-[var(--border-primary)] pt-4">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-3">
            Preview
          </p>
          <div
            className="p-4 border border-[var(--border-primary)] bg-[var(--bg-primary)]"
            style={{
              fontFamily: settings.fontFamily,
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              textAlign: settings.textAlign as 'left' | 'justify',
              padding: `${settings.margins / 2}px`,
            }}
          >
            The quick brown fox jumps over the lazy dog. Typography matters for
            comfortable reading.
          </div>
        </div>
      </div>
    </Modal>
  );
}
