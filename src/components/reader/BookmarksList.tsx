'use client';

import { useState } from 'react';
import { useReaderStore } from '@/lib/stores/reader-store';
import { Modal, Button, Input } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface BookmarksListProps {
  onNavigate: (location: string) => void;
}

export function BookmarksList({ onNavigate }: BookmarksListProps) {
  const {
    bookmarks,
    removeBookmark,
    updateBookmarkNote,
    isBookmarksOpen,
    setBookmarksOpen,
  } = useReaderStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const handleNavigate = (location: string) => {
    onNavigate(location);
    setBookmarksOpen(false);
  };

  const handleStartEdit = (id: string, currentNote: string | null) => {
    setEditingId(id);
    setEditNote(currentNote || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateBookmarkNote(id, editNote);
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

  return (
    <Modal
      isOpen={isBookmarksOpen}
      onClose={() => setBookmarksOpen(false)}
      title="Bookmarks"
      size="md"
    >
      {bookmarks.length === 0 ? (
        <div className="py-10 text-center border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="bookmark" size={20} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            No bookmarks yet
          </p>
          <p className="font-[family-name:var(--font-system)] text-[11px] text-[var(--text-tertiary)] mt-2">
            Click the bookmark icon while reading to save your place
          </p>
        </div>
      ) : (
        <ul className="space-y-[1px] bg-[var(--border-primary)] max-h-[60vh] overflow-y-auto">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="bg-[var(--bg-primary)] p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <button
                  onClick={() => handleNavigate(bookmark.location)}
                  className="flex-1 text-left group"
                >
                  <h4 className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em] group-hover:underline">
                    {bookmark.title || 'Untitled Bookmark'}
                  </h4>
                  {bookmark.page && (
                    <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-tertiary)]">
                      Page {bookmark.page}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-[1px] bg-[var(--border-primary)]">
                  <button
                    onClick={() => handleStartEdit(bookmark.id, bookmark.note)}
                    className="p-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    aria-label="Edit note"
                  >
                    <PixelIcon name="edit" size={12} />
                  </button>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="p-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <PixelIcon name="trash" size={12} />
                  </button>
                </div>
              </div>

              {editingId === bookmark.id ? (
                <div className="space-y-2 border-t border-[var(--border-primary)] pt-2 mt-2">
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Add a note..."
                    fullWidth
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleSaveNote(bookmark.id)}>
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
              ) : bookmark.note ? (
                <p className="font-[family-name:var(--font-system)] text-[11px] text-[var(--text-secondary)] border-l-2 border-[var(--border-primary)] pl-2 mt-2">
                  {bookmark.note}
                </p>
              ) : null}

              <p className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--text-tertiary)] mt-2 uppercase">
                {formatDate(bookmark.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
