'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useStreakStore } from '@/lib/stores/streak-store';
import { Modal, Button } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

const PRESET_GOALS = {
  pages: [5, 10, 20, 30, 50],
  minutes: [10, 15, 20, 30, 45, 60],
};

export function StreakGoalModal() {
  const {
    goal,
    setGoal,
    isGoalModalOpen,
    setGoalModalOpen,
  } = useStreakStore();

  const [selectedType, setSelectedType] = useState<'pages' | 'minutes'>(goal.type);
  const [selectedTarget, setSelectedTarget] = useState(goal.target);
  const [customValue, setCustomValue] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSave = () => {
    const target = showCustom ? parseInt(customValue) || selectedTarget : selectedTarget;
    setGoal({ type: selectedType, target });
    setGoalModalOpen(false);
  };

  const presets = PRESET_GOALS[selectedType];

  return (
    <Modal
      isOpen={isGoalModalOpen}
      onClose={() => setGoalModalOpen(false)}
      title="Set Reading Goal"
      size="md"
    >
      <div className="space-y-6">
        {/* Goal Type Toggle */}
        <div>
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-3">
            Track By
          </p>
          <div className="grid grid-cols-2 gap-[1px] bg-[var(--border-primary)]">
            <button
              onClick={() => {
                setSelectedType('minutes');
                setSelectedTarget(PRESET_GOALS.minutes[1]);
                setShowCustom(false);
              }}
              className={clsx(
                'flex items-center justify-center gap-2 py-3 transition-colors',
                selectedType === 'minutes'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
              )}
            >
              <PixelIcon name="clock" size={16} />
              <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide">
                Minutes
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedType('pages');
                setSelectedTarget(PRESET_GOALS.pages[1]);
                setShowCustom(false);
              }}
              className={clsx(
                'flex items-center justify-center gap-2 py-3 transition-colors',
                selectedType === 'pages'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
              )}
            >
              <PixelIcon name="book" size={16} />
              <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide">
                Pages
              </span>
            </button>
          </div>
        </div>

        {/* Daily Target */}
        <div>
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-3">
            Daily Target
          </p>

          {/* Preset options */}
          <div className="grid grid-cols-3 gap-[1px] bg-[var(--border-primary)] mb-3">
            {presets.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setSelectedTarget(value);
                  setShowCustom(false);
                }}
                className={clsx(
                  'py-3 transition-colors font-[family-name:var(--font-mono)] fs-p-lg',
                  selectedTarget === value && !showCustom
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {/* Custom value toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={clsx(
              'w-full py-2 border border-[var(--border-primary)] transition-colors',
              'font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-wide',
              showCustom
                ? 'bg-[var(--bg-secondary)]'
                : 'hover:bg-[var(--bg-secondary)]'
            )}
          >
            {showCustom ? 'Use Preset' : 'Custom Amount'}
          </button>

          {/* Custom input */}
          {showCustom && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="999"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={String(selectedTarget)}
                className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] font-[family-name:var(--font-mono)] fs-p-lg text-center focus:outline-none focus:border-[var(--text-primary)]"
              />
              <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase text-[var(--text-tertiary)]">
                {selectedType === 'pages' ? 'pages/day' : 'min/day'}
              </span>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
          <p className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] mb-2">
            Your Goal
          </p>
          <p className="font-[family-name:var(--font-display)] fs-h-sm uppercase tracking-tight">
            Read {showCustom ? (customValue || selectedTarget) : selectedTarget} {selectedType === 'pages' ? 'pages' : 'minutes'} daily
          </p>
          <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-tertiary)] mt-1">
            {selectedType === 'minutes'
              ? 'Time tracked automatically while reading'
              : 'Pages tracked from PDF reader progress'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setGoalModalOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Save Goal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
