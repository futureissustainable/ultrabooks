'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, Button, Toggle } from '@/components/ui';
import { useShareStore } from '@/lib/stores/share-store';
import { getCoverUrl } from '@/lib/supabase/storage';
import type { Book } from '@/lib/supabase/types';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface ShareModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

const EXPIRY_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
] as const;

export function ShareModal({ book, isOpen, onClose }: ShareModalProps) {
  const { createShare, isCreating } = useShareStore();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [options, setOptions] = useState({
    includeBookmarks: true,
    includeHighlights: true,
    includeNotes: false,
  });

  // Get cover URL (handles both legacy URLs and new paths)
  const coverUrl = getCoverUrl(book.cover_url);

  const handleCreateShare = async () => {
    const { shareCode, error } = await createShare(book.id, {
      ...options,
      expiresInHours,
    });

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
              {coverUrl ? (
                <div className="relative w-14 h-20 flex-shrink-0 border border-[var(--border-primary)]">
                  <Image
                    src={coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-20 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center">
                  <PixelIcon name="book" size={20} className="text-[var(--text-tertiary)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-ui fs-p-sm uppercase tracking-[0.02em] text-[var(--text-primary)] truncate">{book.title}</h3>
                {book.author && (
                  <p className="font-ui fs-p-sm text-[var(--text-secondary)] mt-1">{book.author}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">Include with share</h4>

              <div className="border border-[var(--border-primary)]">
                <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
                  <div>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.02em]">Bookmarks</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">Share your saved bookmarks</p>
                  </div>
                  <Toggle
                    checked={options.includeBookmarks}
                    onChange={(checked) => setOptions({ ...options, includeBookmarks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
                  <div>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.02em]">Highlights</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">Share your highlighted passages</p>
                  </div>
                  <Toggle
                    checked={options.includeHighlights}
                    onChange={(checked) => setOptions({ ...options, includeHighlights: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.02em]">Notes</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">Share your personal notes</p>
                  </div>
                  <Toggle
                    checked={options.includeNotes}
                    onChange={(checked) => setOptions({ ...options, includeNotes: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Expiry Selection */}
            <div className="space-y-3">
              <h4 className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">Link expires in</h4>
              <div className="grid grid-cols-4 gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExpiresInHours(option.value)}
                    className={`p-3 border text-center transition-colors ${
                      expiresInHours === option.value
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                        : 'border-[var(--border-primary)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="font-mono fs-p-sm">{option.label}</span>
                  </button>
                ))}
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
                <PixelIcon name="check-circle" size={24} className="text-[var(--bg-primary)]" />
              </div>
              <h3 className="font-display fs-h-sm uppercase mb-2">Link Created</h3>
              <p className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Anyone with this link can view your book
              </p>
            </div>

            <div className="flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-3 bg-transparent font-mono fs-p-sm outline-none truncate"
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
