'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useShareStore } from '@/lib/stores/share-store';
import { useBookStore } from '@/lib/stores/book-store';
import { getCoverUrl } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Spinner } from '@/components/ui';
import type { Book, Bookmark, Highlight } from '@/lib/supabase/types';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface ShareLink {
  id: string;
  user_id: string;
  share_code: string;
  title: string | null;
  include_bookmarks: boolean;
  include_highlights: boolean;
  include_notes: boolean;
  allow_add_to_library: boolean;
  is_active: boolean;
  view_count: number;
  expires_at: string;
  created_at: string;
}

interface SharedCollectionData {
  shareLink: ShareLink;
  books: Book[];
  bookmarks?: Record<string, Bookmark[]>;
  highlights?: Record<string, Highlight[]>;
}

export default function CollectionSharePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { getCollectionByCode } = useShareStore();
  const { copyBookToLibrary, isCopying } = useBookStore();
  const [data, setData] = useState<SharedCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [addingBook, setAddingBook] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollection() {
      if (!code) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      // Check auth status
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      const result = await getCollectionByCode(code);
      if (result) {
        setData(result);
      } else {
        setError('This share link is invalid or has expired');
      }
      setLoading(false);
    }

    loadCollection();
  }, [code, getCollectionByCode]);

  const handleAddToLibrary = async (book: Book) => {
    if (!data?.shareLink || !isAuthenticated) return;

    setAddingBook(book.id);
    setAddError(null);

    const { error: copyError } = await copyBookToLibrary({
      shareLinkId: data.shareLink.id,
      originalBookId: book.id,
      sourceBook: {
        title: book.title,
        author: book.author,
        file_url: book.file_url,
        cover_url: book.cover_url,
        file_type: book.file_type,
        file_size: book.file_size,
      },
    });

    if (copyError) {
      setAddError(copyError);
    } else {
      setAddedBooks(prev => new Set(prev).add(book.id));
    }
    setAddingBook(null);
  };

  const handleAddAllToLibrary = async () => {
    if (!data?.shareLink || !isAuthenticated) return;

    for (const book of data.books) {
      if (!addedBooks.has(book.id)) {
        await handleAddToLibrary(book);
      }
    }
  };

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
          <h1 className="fs-h-lg font-bold mb-3">Collection Not Found</h1>
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

  const { shareLink, books, bookmarks, highlights } = data;

  // Calculate time remaining until expiry
  const getExpiryText = () => {
    if (!shareLink.expires_at) return null;
    const expiresAt = new Date(shareLink.expires_at);
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
  const allBooksAdded = books.every(b => addedBooks.has(b.id));

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
              <span className="fs-p-lg text-[var(--text-tertiary)]">Shared collection</span>
              {!isAuthenticated && (
                <Link href="/signup">
                  <Button size="sm">Sign Up Free</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          {/* Collection Info */}
          <Card padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-[var(--text-primary)] flex items-center justify-center">
                  <PixelIcon name="library" size={32} className="text-[var(--bg-primary)]" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="fs-h-lg font-bold mb-2">
                  {shareLink.title || 'Shared Collection'}
                </h1>
                <p className="text-[var(--text-secondary)] mb-4">
                  {books.length} {books.length === 1 ? 'book' : 'books'} shared with you
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {shareLink.include_bookmarks && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full fs-p-lg">
                      Includes Bookmarks
                    </span>
                  )}
                  {shareLink.include_highlights && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full fs-p-lg">
                      Includes Highlights
                    </span>
                  )}
                  {shareLink.allow_add_to_library && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full fs-p-lg">
                      Add to Library
                    </span>
                  )}
                </div>
                {expiryText && (
                  <p className="fs-p-sm text-[var(--text-tertiary)] flex items-center gap-2">
                    <PixelIcon name="clock" size={14} />
                    {expiryText}
                  </p>
                )}
              </div>

              {/* Add All Button */}
              {shareLink.allow_add_to_library && isAuthenticated && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleAddAllToLibrary}
                    disabled={isCopying || allBooksAdded}
                    className={allBooksAdded ? 'bg-green-600 hover:bg-green-600' : ''}
                  >
                    {allBooksAdded ? (
                      <>
                        <PixelIcon name="check" size={14} className="mr-2" />
                        All Added
                      </>
                    ) : (
                      <>
                        <PixelIcon name="plus" size={14} className="mr-2" />
                        Add All to Library
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Error Message */}
          {addError && (
            <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <p className="fs-p-sm">{addError}</p>
            </div>
          )}

          {/* Books Grid */}
          <h2 className="fs-h-sm font-semibold mb-4 flex items-center gap-2">
            <PixelIcon name="book" size={20} />
            Books
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {books.map((book) => {
              const coverUrl = getCoverUrl(book.cover_url);
              const bookBookmarks = bookmarks?.[book.id] || [];
              const bookHighlights = highlights?.[book.id] || [];
              const isAdded = addedBooks.has(book.id);
              const isAdding = addingBook === book.id;

              return (
                <Card key={book.id} padding="none" className="overflow-hidden">
                  <div className="aspect-[2/3] bg-[var(--bg-tertiary)] relative">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PixelIcon name="book" size={32} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}

                    {/* Add to Library overlay */}
                    {shareLink.allow_add_to_library && isAuthenticated && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <Button
                          size="sm"
                          onClick={() => handleAddToLibrary(book)}
                          disabled={isAdding || isAdded || isCopying}
                          className={isAdded ? 'bg-green-600 hover:bg-green-600' : ''}
                        >
                          {isAdding ? (
                            <Spinner size="sm" />
                          ) : isAdded ? (
                            <>
                              <PixelIcon name="check" size={12} className="mr-1" />
                              Added
                            </>
                          ) : (
                            <>
                              <PixelIcon name="plus" size={12} className="mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Added indicator */}
                    {isAdded && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <PixelIcon name="check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-ui fs-p-sm uppercase tracking-[0.02em] truncate" title={book.title}>
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="font-ui fs-p-sm text-[var(--text-secondary)] truncate">
                        {book.author}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {bookBookmarks.length > 0 && (
                        <span className="fs-p-sm text-[var(--text-tertiary)]">
                          {bookBookmarks.length} bookmarks
                        </span>
                      )}
                      {bookHighlights.length > 0 && (
                        <span className="fs-p-sm text-[var(--text-tertiary)]">
                          {bookHighlights.length} highlights
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Sign up CTA for non-authenticated users */}
          {!isAuthenticated && shareLink.allow_add_to_library && (
            <Card padding="lg" className="text-center bg-gradient-to-br from-[var(--accent)] to-blue-700">
              <h2 className="fs-h-sm font-bold text-white mb-3">Add These Books to Your Library</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Sign up for a free account to add these {books.length} books to your personal library and sync across all devices.
              </p>
              <Link href="/signup">
                <Button className="bg-white text-[var(--accent)] hover:bg-gray-100">
                  Create Free Account
                </Button>
              </Link>
            </Card>
          )}

          {/* Already added message */}
          {isAuthenticated && allBooksAdded && (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PixelIcon name="check" size={32} className="text-white" />
              </div>
              <h2 className="fs-h-sm font-bold mb-3">All Books Added!</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                These books are now in your library.
              </p>
              <Link href="/library">
                <Button>Go to Library</Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
