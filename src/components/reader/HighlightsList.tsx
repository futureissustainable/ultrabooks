'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useReaderStore } from '@/lib/stores/reader-store';
import { Modal, Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface HighlightsListProps {
  onNavigate: (location: string) => void;
}

// Monochrome highlight styles for brutalist design
const highlightStyles = [
  { name: 'light', class: 'bg-[var(--gray-200)]', label: '25%' },
  { name: 'medium', class: 'bg-[var(--gray-300)]', label: '50%' },
  { name: 'dark', class: 'bg-[var(--gray-400)]', label: '75%' },
  { name: 'solid', class: 'bg-[var(--gray-500)] text-white', label: '100%' },
];

export function HighlightsList({ onNavigate }: HighlightsListProps) {
  const {
    highlights,
    removeHighlight,
    updateHighlightNote,
    updateHighlightColor,
    isHighlightsOpen,
    setHighlightsOpen,
  } = useReaderStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const handleNavigate = (location: string) => {
    onNavigate(location);
    setHighlightsOpen(false);
  };

  const handleStartEdit = (id: string, currentNote: string | null) => {
    setEditingId(id);
    setEditNote(currentNote || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateHighlightNote(id, editNote);
    setEditingId(null);
    setEditNote('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHighlightStyle = (color: string) => {
    const style = highlightStyles.find(s => s.name === color);
    return style?.class || highlightStyles[0].class;
  };

  return (
    <Modal
      isOpen={isHighlightsOpen}
      onClose={() => setHighlightsOpen(false)}
      title="Highlights"
      size="md"
    >
      {highlights.length === 0 ? (
        <div className="py-10 text-center border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="highlight" size={20} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            No highlights yet
          </p>
          <p className="font-[family-name:var(--font-system)] text-[11px] text-[var(--text-tertiary)] mt-2">
            Select text while reading to highlight it
          </p>
        </div>
      ) : (
        <ul className="space-y-[1px] bg-[var(--border-primary)] max-h-[60vh] overflow-y-auto">
          {highlights.map((highlight) => (
            <li
              key={highlight.id}
              className="bg-[var(--bg-primary)] p-3"
            >
              <button
                onClick={() => handleNavigate(highlight.cfi_range)}
                className="block w-full text-left mb-3"
              >
                <p
                  className={clsx(
                    'font-[family-name:var(--font-system)] text-[12px] px-1 inline leading-relaxed',
                    getHighlightStyle(highlight.color)
                  )}
                >
                  &ldquo;{highlight.text}&rdquo;
                </p>
              </button>

              {/* Monochrome intensity picker */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                  Intensity:
                </span>
                <div className="flex items-center gap-[1px] bg-[var(--border-primary)]">
                  {highlightStyles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => updateHighlightColor(highlight.id, style.name)}
                      className={clsx(
                        'w-6 h-6 flex items-center justify-center text-[8px] font-[family-name:var(--font-mono)] transition-colors',
                        style.class,
                        highlight.color === style.name
                          ? 'ring-1 ring-[var(--text-primary)] ring-offset-1'
                          : ''
                      )}
                      aria-label={`Change to ${style.label} intensity`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-[1px] bg-[var(--border-primary)]">
                  <button
                    onClick={() => handleStartEdit(highlight.id, highlight.note)}
                    className="p-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    aria-label="Edit note"
                  >
                    <PixelIcon name="edit" size={12} />
                  </button>
                  <button
                    onClick={() => removeHighlight(highlight.id)}
                    className="p-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    aria-label="Remove highlight"
                  >
                    <PixelIcon name="trash" size={12} />
                  </button>
                </div>
              </div>

              {editingId === highlight.id ? (
                <div className="space-y-2 border-t border-[var(--border-primary)] pt-2 mt-2">
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Add a note..."
                    fullWidth
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleSaveNote(highlight.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : highlight.note ? (
                <p className="font-[family-name:var(--font-system)] text-[11px] text-[var(--text-secondary)] border-l-2 border-[var(--border-primary)] pl-2 mt-2">
                  {highlight.note}
                </p>
              ) : null}

              <p className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--text-tertiary)] mt-2 uppercase">
                {formatDate(highlight.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
