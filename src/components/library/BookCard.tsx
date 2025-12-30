'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/lib/supabase/types';
import { useBookStore } from '@/lib/stores/book-store';
import { Card, Button, Modal } from '@/components/ui';
import { ShareModal } from './ShareModal';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { deleteBook, isLoading } = useBookStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
      <Card variant="default" padding="none" className="group relative overflow-hidden hover:border-[var(--border-strong)] transition-all duration-[50ms]">
        {/* Cover or Placeholder */}
        <Link href={`/reader/${book.id}`}>
          <div className="aspect-[3/4] bg-[var(--bg-tertiary)] flex items-center justify-center relative overflow-hidden border-b border-[var(--border-primary)]">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="w-12 h-12 bg-[var(--text-primary)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-[var(--bg-primary)]">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] text-[var(--text-tertiary)] border border-[var(--border-primary)] px-2 py-1">
                  {book.file_type}
                </span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[var(--bg-primary)]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-[50ms] flex items-center justify-center">
              <span className="font-[family-name:var(--font-ui)] fs-p-sm uppercase tracking-[0.05em] px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)]">
                Open
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
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-[50ms] border border-transparent hover:border-[var(--border-primary)]"
                aria-label="Share book"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-[50ms] border border-transparent hover:border-[var(--border-primary)]"
                aria-label="Delete book"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
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
