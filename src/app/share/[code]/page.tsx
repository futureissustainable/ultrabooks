'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useShareStore } from '@/lib/stores/share-store';
import { getCoverUrl } from '@/lib/supabase/storage';
import { Card, Button, Spinner } from '@/components/ui';
import type { SharedBook, Book, Bookmark, Highlight } from '@/lib/supabase/types';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface SharedBookData {
  share: SharedBook;
  book: Book;
  bookmarks?: Bookmark[];
  highlights?: Highlight[];
}

export default function SharePage() {
  const params = useParams();
  const code = params.code as string;
  const { getShareByCode } = useShareStore();
  const [data, setData] = useState<SharedBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShare() {
      if (!code) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      const result = await getShareByCode(code);
      if (result) {
        setData(result);
      } else {
        setError('This share link is invalid or has expired');
      }
      setLoading(false);
    }

    loadShare();
  }, [code, getShareByCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-6">
            <PixelIcon name="alert" size={40} className="text-[var(--text-secondary)]" />
          </div>
          <h1 className="fs-h-lg font-bold mb-3">Share Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {error || 'This share link is invalid or has expired.'}
          </p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { book, bookmarks, highlights, share } = data;

  // Get cover URL (handles both legacy URLs and new paths)
  const coverUrl = getCoverUrl(book.cover_url);

  // Calculate time remaining until expiry
  const getExpiryText = () => {
    if (!share.expires_at) return null;
    const expiresAt = new Date(share.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Expires in ${diffHours}h ${diffMinutes}m`;
    }
    return `Expires in ${diffMinutes} minutes`;
  };

  const expiryText = getExpiryText();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-primary)]">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="fs-h-sm font-semibold text-[var(--text-primary)]">
              ULTRABOOKS
            </Link>
            <div className="flex items-center gap-3">
              <span className="fs-p-lg text-[var(--text-tertiary)]">Shared book</span>
              <Link href="/signup">
                <Button size="sm">Sign Up Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          {/* Book Info */}
          <Card padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {coverUrl ? (
                <div className="relative w-40 h-60 mx-auto md:mx-0 flex-shrink-0">
                  <Image
                    src={coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-40 h-60 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center mx-auto md:mx-0 flex-shrink-0">
                  <PixelIcon name="book" size={48} className="text-[var(--text-secondary)]" />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="fs-h-lg font-bold mb-2">{book.title}</h1>
                {book.author && (
                  <p className="fs-h-sm text-[var(--text-secondary)] mb-4">{book.author}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  <span className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full fs-p-lg font-medium uppercase">
                    {book.file_type}
                  </span>
                  {share.include_bookmarks && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full fs-p-lg">
                      {bookmarks?.length || 0} Bookmarks
                    </span>
                  )}
                  {share.include_highlights && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full fs-p-lg">
                      {highlights?.length || 0} Highlights
                    </span>
                  )}
                </div>
                <p className="fs-p-lg text-[var(--text-tertiary)]">
                  This book was shared with you. Sign up to add it to your library and sync across devices.
                </p>
                {expiryText && (
                  <p className="fs-p-sm text-[var(--text-tertiary)] mt-4 flex items-center gap-2">
                    <PixelIcon name="clock" size={14} />
                    {expiryText}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Bookmarks */}
          {share.include_bookmarks && bookmarks && bookmarks.length > 0 && (
            <div className="mb-8">
              <h2 className="fs-h-sm font-semibold mb-4 flex items-center gap-2">
                <PixelIcon name="bookmark" size={20} />
                Bookmarks
              </h2>
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} padding="md" className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center flex-shrink-0">
                        <PixelIcon name="bookmark" size={16} className="text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium fs-p-lg">{bookmark.title || 'Untitled Bookmark'}</h3>
                        {bookmark.note && share.include_notes && (
                          <p className="fs-p-lg text-[var(--text-secondary)] mt-1">{bookmark.note}</p>
                        )}
                        {bookmark.page && (
                          <span className="fs-p-sm text-[var(--text-tertiary)] mt-1 block">
                            Page {bookmark.page}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {share.include_highlights && highlights && highlights.length > 0 && (
            <div className="mb-8">
              <h2 className="fs-h-sm font-semibold mb-4 flex items-center gap-2">
                <PixelIcon name="highlight" size={20} />
                Highlights
              </h2>
              <div className="space-y-3">
                {highlights.map((highlight) => (
                  <Card key={highlight.id} padding="md" className="border-l-4" style={{ borderLeftColor: highlight.color || '#fbbf24' }}>
                    <blockquote className="fs-p-lg leading-relaxed">
                      &ldquo;{highlight.text}&rdquo;
                    </blockquote>
                    {highlight.note && share.include_notes && (
                      <p className="fs-p-lg text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-primary)]">
                        {highlight.note}
                      </p>
                    )}
                    {highlight.page && (
                      <span className="fs-p-sm text-[var(--text-tertiary)] mt-2 block">
                        Page {highlight.page}
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Card padding="lg" className="text-center bg-gradient-to-br from-[var(--accent)] to-blue-700">
            <h2 className="fs-h-sm font-bold text-white mb-3">Start Your Library</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Create a free account to upload your own books and sync across all devices.
            </p>
            <Link href="/signup">
              <Button className="bg-white text-[var(--accent)] hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
