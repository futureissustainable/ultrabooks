'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/lib/supabase/types';
import { useBookStore } from '@/lib/stores/book-store';
import { getCoverUrl } from '@/lib/supabase/storage';
import { Card, Button, Modal } from '@/components/ui';
import { ShareModal } from './ShareModal';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { DownloadForOffline } from '@/components/pwa/DownloadForOffline';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { deleteBook, isLoading } = useBookStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Get cover URL (handles both legacy URLs and new paths)
  const coverUrl = getCoverUrl(book.cover_url);

  const handleDelete = async () => {
    await deleteBook(book.id);
    setShowDeleteConfirm(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card variant="default" padding="none" className="group relative overflow-hidden card-lift focus-ring">
        {/* Cover or Placeholder */}
        <Link href={`/reader/${book.id}`}>
          <div className="aspect-[2/3] bg-[var(--bg-tertiary)] flex items-center justify-center relative overflow-hidden border-b border-[var(--border-primary)]">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={book.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
                  <PixelIcon name="book" size={24} className="text-[var(--bg-primary)]" />
                </div>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] border border-[var(--border-primary)] px-2 py-1">
                  {book.file_type}
                </span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[var(--bg-primary)]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center justify-center backdrop-blur-sm">
              <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)] btn-shine">
                Read Now
              </span>
            </div>
          </div>
        </Link>

        {/* Book Info */}
        <div className="p-3">
          <h3 className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.02em] truncate mb-1" title={book.title}>
            {book.title}
          </h3>
          {book.author && (
            <p className="font-[family-name:var(--font-ui)] fs-p-sm text-[var(--text-secondary)] truncate mb-3">
              {book.author}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-mono)] fs-p-sm text-[var(--text-tertiary)]">
              {formatFileSize(book.file_size)}
            </span>
            <div className="flex items-center gap-1">
              <DownloadForOffline
                bookId={book.id}
                fileUrl={book.file_url}
                variant="icon"
                className="!p-1.5 !min-w-0 !min-h-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-100 !border-transparent hover:!border-[var(--border-primary)] focus-ring"
              />
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-100 border border-transparent hover:border-[var(--border-primary)] focus-ring"
                aria-label="Share book"
              >
                <PixelIcon name="share" size={12} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-100 border border-transparent hover:border-[var(--border-primary)] focus-ring"
                aria-label="Delete book"
              >
                <PixelIcon name="trash" size={12} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Book"
        size="sm"
      >
        <div className="space-y-6">
          <p className="font-[family-name:var(--font-ui)] fs-p-lg text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to delete &ldquo;{book.title}&rdquo;? This will also remove all
            bookmarks, highlights, and reading progress.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <ShareModal
        book={book}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
}
