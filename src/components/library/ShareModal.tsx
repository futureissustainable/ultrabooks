'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, Button, Toggle } from '@/components/ui';
import { useShareStore } from '@/lib/stores/share-store';
import type { Book } from '@/lib/supabase/types';

interface ShareModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ book, isOpen, onClose }: ShareModalProps) {
  const { createShare, isCreating } = useShareStore();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    includeBookmarks: true,
    includeHighlights: true,
    includeNotes: false,
  });

  const handleCreateShare = async () => {
    const { shareCode, error } = await createShare(book.id, options);

    if (shareCode && !error) {
      const link = `${window.location.origin}/share/${shareCode}`;
      setShareLink(link);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Book" size="md">
      <div className="space-y-6">
        {!shareLink ? (
          <>
            <div className="flex items-start gap-4 p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              {book.cover_url ? (
                <div className="relative w-14 h-20 flex-shrink-0 border border-[var(--border-primary)]">
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-20 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--text-tertiary)]">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em] text-[var(--text-primary)] truncate">{book.title}</h3>
                {book.author && (
                  <p className="font-[family-name:var(--font-ui)] text-[11px] text-[var(--text-secondary)] mt-1">{book.author}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">Include with share</h4>

              <div className="border border-[var(--border-primary)]">
                <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em]">Bookmarks</p>
                    <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--text-tertiary)]">Share your saved bookmarks</p>
                  </div>
                  <Toggle
                    checked={options.includeBookmarks}
                    onChange={(checked) => setOptions({ ...options, includeBookmarks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em]">Highlights</p>
                    <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--text-tertiary)]">Share your highlighted passages</p>
                  </div>
                  <Toggle
                    checked={options.includeHighlights}
                    onChange={(checked) => setOptions({ ...options, includeHighlights: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.02em]">Notes</p>
                    <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--text-tertiary)]">Share your personal notes</p>
                  </div>
                  <Toggle
                    checked={options.includeNotes}
                    onChange={(checked) => setOptions({ ...options, includeNotes: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={handleClose}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleCreateShare} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-6 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="w-12 h-12 border border-[var(--text-primary)] bg-[var(--text-primary)] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--bg-primary)]">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg uppercase mb-2">Link Created</h3>
              <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Anyone with this link can view your book
              </p>
            </div>

            <div className="flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-3 bg-transparent font-[family-name:var(--font-mono)] text-[11px] outline-none truncate"
              />
              <Button size="sm" onClick={handleCopyLink} className="m-1">
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <Button variant="secondary" fullWidth onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
