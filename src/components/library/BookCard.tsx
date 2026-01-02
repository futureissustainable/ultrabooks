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
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (book: Book) => void;
}

export function BookCard({ book, isSelectionMode, isSelected, onSelect }: BookCardProps) {
  const { deleteBook, isLoading } = useBookStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const coverUrl = getCoverUrl(book.cover_url);

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onSelect) {
      e.preventDefault();
      onSelect(book);
    }
  };

  const handleDelete = async () => {
    await deleteBook(book.id);
    setShowDeleteConfirm(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const coverContent = (
    <div className="aspect-[2/3] bg-[var(--bg-tertiary)] flex items-center justify-center relative overflow-hidden rounded-t-xl">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={book.title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 p-6">
          <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center">
            <PixelIcon name="book" size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded">
            {book.file_type.toUpperCase()}
          </span>
        </div>
      )}

      {/* Selection indicator */}
      {isSelectionMode && (
        <div className="absolute top-3 right-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md ${
            isSelected
              ? 'bg-[var(--text-primary)]'
              : 'bg-[var(--bg-primary)]/90'
          }`}>
            {isSelected && <PixelIcon name="check" size={14} className="text-[var(--bg-primary)]" />}
          </div>
        </div>
      )}

      {/* Hover Overlay - only when not in selection mode */}
      {!isSelectionMode && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
          <span className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-lg">
            Read
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card variant="default" padding="none" className={`group relative overflow-hidden rounded-xl card-lift ${isSelectionMode ? 'cursor-pointer' : ''}`}>
        {isSelectionMode ? (
          <div onClick={handleClick}>
            {coverContent}
          </div>
        ) : (
          <Link href={`/reader/${book.id}`}>
            {coverContent}
          </Link>
        )}

        {/* Book Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium truncate mb-0.5" title={book.title}>
            {book.title}
          </h3>
          {book.author && (
            <p className="text-sm text-[var(--text-secondary)] truncate mb-3">
              {book.author}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              {formatFileSize(book.file_size)}
            </span>
            {!isSelectionMode && (
              <div className="flex items-center gap-1">
                <DownloadForOffline
                  bookId={book.id}
                  fileUrl={book.file_url}
                  variant="icon"
                  className="!p-1.5 !min-w-0 !min-h-0 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                />
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                  aria-label="Share book"
                >
                  <PixelIcon name="share" size={14} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                  aria-label="Delete book"
                >
                  <PixelIcon name="trash" size={14} />
                </button>
              </div>
            )}
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
          <p className="font-ui fs-p-lg text-[var(--text-secondary)] leading-relaxed">
            Delete "{book.title}"? This will remove all bookmarks, highlights, and reading progress.
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
