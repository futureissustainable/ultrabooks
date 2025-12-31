'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, Button, Toggle } from '@/components/ui';
import { useShareStore } from '@/lib/stores/share-store';
import { getCoverUrl } from '@/lib/supabase/storage';
import type { Book } from '@/lib/supabase/types';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface ShareCollectionModalProps {
  books: Book[];
  isOpen: boolean;
  onClose: () => void;
}

const EXPIRY_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
] as const;

export function ShareCollectionModal({ books, isOpen, onClose }: ShareCollectionModalProps) {
  const { createCollectionShare, isCreating } = useShareStore();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [options, setOptions] = useState({
    includeBookmarks: true,
    includeHighlights: true,
    includeNotes: false,
    allowAddToLibrary: true,
  });

  const handleCreateShare = async () => {
    const bookIds = books.map(b => b.id);
    const { shareCode, error } = await createCollectionShare(bookIds, {
      ...options,
      expiresInHours,
      title: collectionTitle || undefined,
    });

    if (shareCode && !error) {
      const link = `${window.location.origin}/share/collection/${shareCode}`;
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
    setCollectionTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Collection" size="md">
      <div className="space-y-6">
        {!shareLink ? (
          <>
            {/* Books Preview */}
            <div className="p-4 border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2 mb-3">
                <PixelIcon name="library" size={16} className="text-[var(--text-secondary)]" />
                <span className="font-ui fs-p-sm uppercase tracking-[0.02em]">
                  {books.length} {books.length === 1 ? 'Book' : 'Books'} Selected
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {books.slice(0, 6).map((book) => {
                  const coverUrl = getCoverUrl(book.cover_url);
                  return (
                    <div
                      key={book.id}
                      className="flex-shrink-0 w-12 h-18 relative border border-[var(--border-primary)]"
                      title={book.title}
                    >
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                          <PixelIcon name="book" size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {books.length > 6 && (
                  <div className="flex-shrink-0 w-12 h-18 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <span className="font-mono fs-p-sm text-[var(--text-secondary)]">
                      +{books.length - 6}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Name */}
            <div className="space-y-2">
              <label className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Collection Name (Optional)
              </label>
              <input
                type="text"
                value={collectionTitle}
                onChange={(e) => setCollectionTitle(e.target.value)}
                placeholder="e.g., My Sci-Fi Favorites"
                className="w-full px-3 py-3 border border-[var(--border-primary)] bg-[var(--bg-secondary)] font-ui fs-p-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
              />
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <h4 className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Include with share
              </h4>

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

                <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
                  <div>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.02em]">Notes</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">Share your personal notes</p>
                  </div>
                  <Toggle
                    checked={options.includeNotes}
                    onChange={(checked) => setOptions({ ...options, includeNotes: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-ui fs-p-sm uppercase tracking-[0.02em]">Allow Add to Library</p>
                    <p className="font-ui fs-p-sm text-[var(--text-tertiary)]">Recipients can copy books to their library</p>
                  </div>
                  <Toggle
                    checked={options.allowAddToLibrary}
                    onChange={(checked) => setOptions({ ...options, allowAddToLibrary: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Expiry Selection */}
            <div className="space-y-3">
              <h4 className="font-ui fs-p-sm uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                Link expires in
              </h4>
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
              <Button fullWidth onClick={handleCreateShare} disabled={isCreating || books.length === 0}>
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
                Anyone with this link can view your {books.length} {books.length === 1 ? 'book' : 'books'}
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
