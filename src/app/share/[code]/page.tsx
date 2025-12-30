'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useShareStore } from '@/lib/stores/share-store';
import { Card, Button, Spinner } from '@/components/ui';
import type { SharedBook, Book, Bookmark, Highlight } from '@/lib/supabase/types';

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
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
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
              {book.cover_url ? (
                <div className="relative w-40 h-60 mx-auto md:mx-0 flex-shrink-0">
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-40 h-60 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto md:mx-0 shadow-lg flex-shrink-0">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
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
              </div>
            </div>
          </Card>

          {/* Bookmarks */}
          {share.include_bookmarks && bookmarks && bookmarks.length > 0 && (
            <div className="mb-8">
              <h2 className="fs-h-sm font-semibold mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Bookmarks
              </h2>
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} padding="md" className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
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
