import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Book } from '@/lib/supabase/types';
import { extractEpubCover, extractEpubMetadata } from '@/lib/epub-utils';
import { generateFileId, extractPathFromLegacyUrl, isLegacyUrl } from '@/lib/supabase/storage';
import { funnels, track } from '@/lib/analytics';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { useCelebrationStore } from '@/components/onboarding/SuccessCelebration';

interface CopyBookParams {
  shareLinkId: string;
  originalBookId: string;
  sourceBook: {
    title: string;
    author?: string | null;
    file_url: string;
    cover_url?: string | null;
    file_type: string;
    file_size: number;
  };
}

interface UploadQuota {
  daily_uploads: number;
  total_uploads: number;
  daily_remaining: number;
  total_remaining: number;
  daily_limit: number;
  total_limit: number;
}

interface BulkUploadResult {
  successful: Book[];
  failed: { file: File; error: string }[];
}

interface UploadProgress {
  current: number;
  total: number;
  currentFile: string;
}

interface BookState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  isLoadingBook: boolean;
  isUploading: boolean;
  isCopying: boolean;
  error: string | null;
  hasFetched: boolean; // Track if we've attempted to fetch library
  hasFetchedBook: boolean; // Track if we've attempted to fetch current book
  quota: UploadQuota | null;
  uploadProgress: UploadProgress | null;
  fetchBooks: () => Promise<void>;
  fetchBook: (id: string) => Promise<void>;
  fetchQuota: () => Promise<void>;
  checkQuota: (count: number) => Promise<{ allowed: boolean; error?: string }>;
  uploadBook: (file: File) => Promise<{ book: Book | null; error: string | null }>;
  uploadBooks: (files: File[]) => Promise<BulkUploadResult>;
  deleteBook: (id: string) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  clearCurrentBook: () => void;
  copyBookToLibrary: (params: CopyBookParams) => Promise<{ book: Book | null; error: string | null }>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  isLoading: false,
  isLoadingBook: false,
  isUploading: false,
  isCopying: false,
  error: null,
  hasFetched: false,
  hasFetchedBook: false,
  quota: null,
  uploadProgress: null,

  fetchBooks: async () => {
    // Prevent duplicate fetches - but allow retry if we're stuck
    const state = get();
    if (state.isLoading && state.hasFetched) return;

    // Mark as fetched AND loading immediately - prevents infinite loading state
    // Even if something goes wrong, we won't be stuck showing "Loading..."
    set({ isLoading: true, hasFetched: true, error: null });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ isLoading: false, books: [] });
        return;
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      set({ books: data || [], isLoading: false });
    } catch (err) {
      console.error('fetchBooks error:', err);
      set({ isLoading: false, error: 'Failed to fetch books' });
    }
  },

  fetchBook: async (id: string) => {
    // Prevent duplicate fetches
    if (get().isLoadingBook) return;

    // Reset hasFetchedBook when fetching a new book
    const supabase = createClient();
    set({ isLoadingBook: true, hasFetchedBook: false, error: null, currentBook: null });

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ isLoadingBook: false, hasFetchedBook: true, error: error.message });
        return;
      }

      set({ currentBook: data, isLoadingBook: false, hasFetchedBook: true });
    } catch (err) {
      set({ isLoadingBook: false, hasFetchedBook: true, error: 'Failed to fetch book' });
    }
  },

  fetchQuota: async () => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_upload_quota', {
        p_user_id: user.id
      });

      if (!error && data) {
        set({ quota: data as UploadQuota });
      }
    } catch (err) {
      console.error('fetchQuota error:', err);
    }
  },

  checkQuota: async (count: number) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { allowed: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase.rpc('check_upload_quota', {
        p_user_id: user.id,
        p_upload_count: count
      });

      if (error) {
        return { allowed: false, error: error.message };
      }

      const result = data as { allowed: boolean; error?: string };
      return { allowed: result.allowed, error: result.error };
    } catch (err) {
      return { allowed: false, error: 'Failed to check quota' };
    }
  },

  uploadBook: async (file: File) => {
    const supabase = createClient();
    set({ isUploading: true, error: null });

    // Track upload started
    const fileSizeMb = Math.round(file.size / (1024 * 1024) * 100) / 100;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    funnels.activation.uploadStarted(fileExt, fileSizeMb);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isUploading: false, error: 'Not authenticated' });
        funnels.activation.uploadFailed(fileExt, 'Not authenticated');
        return { book: null, error: 'Not authenticated' };
      }

      // Check upload quota
      const quotaCheck = await get().checkQuota(1);
      if (!quotaCheck.allowed) {
        set({ isUploading: false, error: quotaCheck.error || 'Upload limit reached' });
        funnels.activation.uploadFailed(fileExt, quotaCheck.error || 'Upload limit reached');
        return { book: null, error: quotaCheck.error || 'Upload limit reached' };
      }

      // Determine file type
      const fileName = file.name.toLowerCase();
      let fileType: 'epub' | 'pdf' | 'mobi';
      if (fileName.endsWith('.epub')) {
        fileType = 'epub';
      } else if (fileName.endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (fileName.endsWith('.mobi')) {
        fileType = 'mobi';
      } else {
        set({ isUploading: false, error: 'Unsupported file type' });
        return { book: null, error: 'Unsupported file type. Please upload EPUB, PDF, or MOBI files.' };
      }

      // Extract title from filename (fallback)
      let title = file.name.replace(/\.(epub|pdf|mobi)$/i, '');
      let author: string | undefined;
      let coverUrl: string | undefined;

      // For EPUBs, try to extract metadata first (before upload) for duplicate check
      if (fileType === 'epub') {
        try {
          const metadata = await extractEpubMetadata(file);
          if (metadata.title) {
            title = metadata.title;
          }
          if (metadata.author) {
            author = metadata.author;
          }
        } catch (epubError) {
          console.error('Error extracting EPUB metadata:', epubError);
        }
      }

      // Check for duplicate by title (case-insensitive)
      const existingBooks = get().books;
      const normalizedTitle = title.toLowerCase().trim();
      const duplicate = existingBooks.find(
        (book) => book.title.toLowerCase().trim() === normalizedTitle
      );

      // If duplicate found, replace the cover instead of skipping
      if (duplicate) {
        // Only replace cover for EPUBs (other formats don't have embedded covers)
        if (fileType === 'epub') {
          try {
            const coverBlob = await extractEpubCover(file);
            if (coverBlob) {
              // Delete old cover from storage if it exists
              if (duplicate.cover_url) {
                const oldCoverPath = isLegacyUrl(duplicate.cover_url)
                  ? extractPathFromLegacyUrl(duplicate.cover_url)
                  : duplicate.cover_url;
                if (oldCoverPath) {
                  await supabase.storage.from('covers').remove([oldCoverPath]);
                }
              }

              // Upload new cover
              const coverExt = coverBlob.type.split('/')[1] || 'jpg';
              const coverId = generateFileId();
              const coverPath = `${user.id}/${coverId}.${coverExt}`;

              const { error: coverUploadError } = await supabase.storage
                .from('covers')
                .upload(coverPath, coverBlob, {
                  contentType: coverBlob.type,
                });

              if (!coverUploadError) {
                // Update book record with new cover
                const { data: updatedBook, error: updateError } = await supabase
                  .from('books')
                  .update({ cover_url: coverPath, updated_at: new Date().toISOString() })
                  .eq('id', duplicate.id)
                  .select()
                  .single();

                if (!updateError && updatedBook) {
                  // Update local state
                  set((state) => ({
                    books: state.books.map((b) =>
                      b.id === duplicate.id ? updatedBook : b
                    ),
                    isUploading: false,
                  }));
                  return { book: updatedBook, error: null };
                }
              }
            }
          } catch (coverError) {
            console.error('Error replacing cover:', coverError);
          }
        }

        // If cover replacement failed or not an EPUB, return the existing book unchanged
        set({ isUploading: false });
        return { book: duplicate, error: null };
      }

      // Upload file to storage with UUID path (unguessable)
      const fileId = generateFileId();
      const filePath = `${user.id}/${fileId}.${fileType}`;
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, file);

      if (uploadError) {
        set({ isUploading: false, error: uploadError.message });
        return { book: null, error: uploadError.message };
      }

      // For EPUBs, extract and upload cover
      if (fileType === 'epub') {
        try {
          const coverBlob = await extractEpubCover(file);
          if (coverBlob) {
            const coverExt = coverBlob.type.split('/')[1] || 'jpg';
            const coverId = generateFileId();
            const coverPath = `${user.id}/${coverId}.${coverExt}`;

            const { error: coverUploadError } = await supabase.storage
              .from('covers')
              .upload(coverPath, coverBlob, {
                contentType: coverBlob.type,
              });

            if (!coverUploadError) {
              coverUrl = coverPath;
            }
          }
        } catch (epubError) {
          console.error('Error extracting EPUB cover:', epubError);
        }
      }

      // Create book record - store paths, not full URLs
      const { data: book, error: insertError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title,
          author,
          cover_url: coverUrl,
          file_url: filePath,
          file_type: fileType,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) {
        set({ isUploading: false, error: insertError.message });
        return { book: null, error: insertError.message };
      }

      // Increment upload count
      await supabase.rpc('increment_upload_count', {
        p_user_id: user.id,
        p_count: 1
      });

      // Refresh quota
      get().fetchQuota();

      // Track successful upload
      funnels.activation.uploadCompleted(book.id, book.title, fileType, fileSizeMb);

      // Check if this is the user's first book for celebration
      const isFirstBook = get().books.length === 0;

      set((state) => ({
        books: [book, ...state.books],
        isUploading: false,
      }));

      // Trigger celebration and milestone completion (after state update)
      if (isFirstBook) {
        // Complete the "first_book" milestone
        useOnboardingStore.getState().completeMilestone('first_book');
        // Trigger celebration
        useCelebrationStore.getState().celebrate('first_book');
      } else {
        // Still show a subtle success for subsequent uploads
        useCelebrationStore.getState().celebrate('upload_complete');
      }

      return { book, error: null };
    } catch (err) {
      set({ isUploading: false, error: 'Upload failed' });
      funnels.activation.uploadFailed(fileExt, 'Upload failed');
      return { book: null, error: 'Upload failed' };
    }
  },

  uploadBooks: async (files: File[]) => {
    const supabase = createClient();
    const successful: Book[] = [];
    const failed: { file: File; error: string }[] = [];

    set({ isUploading: true, error: null, uploadProgress: { current: 0, total: files.length, currentFile: '' } });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isUploading: false, uploadProgress: null, error: 'Not authenticated' });
        return { successful: [], failed: files.map(f => ({ file: f, error: 'Not authenticated' })) };
      }

      // Check quota for all files at once
      const quotaCheck = await get().checkQuota(files.length);
      if (!quotaCheck.allowed) {
        set({ isUploading: false, uploadProgress: null, error: quotaCheck.error || 'Upload limit reached' });
        return { successful: [], failed: files.map(f => ({ file: f, error: quotaCheck.error || 'Upload limit reached' })) };
      }

      // Get existing books for duplicate detection and cover replacement
      const existingBooks = get().books;
      const existingBooksByTitle = new Map<string, Book>(
        existingBooks.map((book) => [book.title.toLowerCase().trim(), book])
      );
      // Track titles we're adding in this batch to avoid duplicates within the batch
      const batchTitles = new Set<string>();
      // Track books that were updated (cover replaced)
      const updated: Book[] = [];

      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        set({ uploadProgress: { current: i + 1, total: files.length, currentFile: file.name } });

        // Validate file type
        const fileName = file.name.toLowerCase();
        let fileType: 'epub' | 'pdf' | 'mobi';
        if (fileName.endsWith('.epub')) {
          fileType = 'epub';
        } else if (fileName.endsWith('.pdf')) {
          fileType = 'pdf';
        } else if (fileName.endsWith('.mobi')) {
          fileType = 'mobi';
        } else {
          failed.push({ file, error: 'Unsupported file type' });
          continue;
        }

        // Validate file size (100MB max)
        if (file.size > 100 * 1024 * 1024) {
          failed.push({ file, error: 'File too large (max 100MB)' });
          continue;
        }

        // Extract metadata first for duplicate check
        let title = file.name.replace(/\.(epub|pdf|mobi)$/i, '');
        let author: string | undefined;
        let coverUrl: string | undefined;

        if (fileType === 'epub') {
          try {
            const metadataPromise = Promise.race([
              extractEpubMetadata(file),
              new Promise<{ title?: string; author?: string }>((_, reject) =>
                setTimeout(() => reject(new Error('Metadata extraction timeout')), 10000)
              )
            ]);

            try {
              const metadata = await metadataPromise;
              if (metadata.title) title = metadata.title;
              if (metadata.author) author = metadata.author;
            } catch (metaErr) {
              console.warn(`Metadata extraction failed for ${file.name}:`, metaErr);
            }
          } catch (epubError) {
            console.warn(`EPUB metadata processing failed for ${file.name}:`, epubError);
          }
        }

        // Check for duplicate
        const normalizedTitle = title.toLowerCase().trim();

        // Check for duplicate within the current batch
        if (batchTitles.has(normalizedTitle)) {
          failed.push({ file, error: `"${title}" appears multiple times in this upload` });
          continue;
        }

        // Check for existing book in library - if found, replace cover instead of skipping
        const existingBook = existingBooksByTitle.get(normalizedTitle);
        if (existingBook) {
          // Only replace cover for EPUBs (other formats don't have embedded covers)
          if (fileType === 'epub') {
            try {
              const coverPromise = Promise.race([
                extractEpubCover(file),
                new Promise<Blob | null>((resolve) =>
                  setTimeout(() => resolve(null), 10000)
                )
              ]);

              const coverBlob = await coverPromise;
              if (coverBlob) {
                // Delete old cover from storage if it exists
                if (existingBook.cover_url) {
                  const oldCoverPath = isLegacyUrl(existingBook.cover_url)
                    ? extractPathFromLegacyUrl(existingBook.cover_url)
                    : existingBook.cover_url;
                  if (oldCoverPath) {
                    await supabase.storage.from('covers').remove([oldCoverPath]);
                  }
                }

                // Upload new cover
                const coverExt = coverBlob.type.split('/')[1] || 'jpg';
                const coverId = generateFileId();
                const coverPath = `${user.id}/${coverId}.${coverExt}`;

                const { error: coverUploadError } = await supabase.storage
                  .from('covers')
                  .upload(coverPath, coverBlob, { contentType: coverBlob.type });

                if (!coverUploadError) {
                  // Update book record with new cover
                  const { data: updatedBook, error: updateError } = await supabase
                    .from('books')
                    .update({ cover_url: coverPath, updated_at: new Date().toISOString() })
                    .eq('id', existingBook.id)
                    .select()
                    .single();

                  if (!updateError && updatedBook) {
                    updated.push(updatedBook);
                    // Update the map so subsequent lookups see the updated book
                    existingBooksByTitle.set(normalizedTitle, updatedBook);
                  }
                }
              }
            } catch (coverErr) {
              console.warn(`Cover replacement failed for ${file.name}:`, coverErr);
            }
          }
          // Mark this title as processed (even if cover replacement failed/skipped)
          batchTitles.add(normalizedTitle);
          continue;
        }

        try {
          // Upload file to storage
          const fileId = generateFileId();
          const filePath = `${user.id}/${fileId}.${fileType}`;
          const { error: uploadError } = await supabase.storage
            .from('books')
            .upload(filePath, file);

          if (uploadError) {
            failed.push({ file, error: uploadError.message });
            continue;
          }

          // Extract cover for EPUBs
          if (fileType === 'epub') {
            try {
              const coverPromise = Promise.race([
                extractEpubCover(file),
                new Promise<Blob | null>((resolve) =>
                  setTimeout(() => resolve(null), 10000)
                )
              ]);

              const coverBlob = await coverPromise;
              if (coverBlob) {
                const coverExt = coverBlob.type.split('/')[1] || 'jpg';
                const coverId = generateFileId();
                const coverPath = `${user.id}/${coverId}.${coverExt}`;

                const { error: coverUploadError } = await supabase.storage
                  .from('covers')
                  .upload(coverPath, coverBlob, { contentType: coverBlob.type });

                if (!coverUploadError) {
                  coverUrl = coverPath;
                }
              }
            } catch (coverErr) {
              console.warn(`Cover extraction failed for ${file.name}:`, coverErr);
            }
          }

          // Create book record
          const { data: book, error: insertError } = await supabase
            .from('books')
            .insert({
              user_id: user.id,
              title,
              author,
              cover_url: coverUrl,
              file_url: filePath,
              file_type: fileType,
              file_size: file.size,
            })
            .select()
            .single();

          if (insertError) {
            failed.push({ file, error: insertError.message });
            continue;
          }

          // Track this title to avoid duplicates within the batch
          batchTitles.add(normalizedTitle);
          successful.push(book);
        } catch (err) {
          failed.push({ file, error: 'Upload failed' });
        }
      }

      // Increment upload count for successful uploads
      if (successful.length > 0) {
        await supabase.rpc('increment_upload_count', {
          p_user_id: user.id,
          p_count: successful.length
        });

        // Refresh quota
        get().fetchQuota();
      }

      // Update state with all successful books and updated covers
      set((state) => {
        // Create a map of updated books for quick lookup
        const updatedBooksMap = new Map(updated.map(b => [b.id, b]));

        // Update existing books with new covers, then prepend new books
        const updatedExistingBooks = state.books.map(book =>
          updatedBooksMap.has(book.id) ? updatedBooksMap.get(book.id)! : book
        );

        return {
          books: [...successful, ...updatedExistingBooks],
          isUploading: false,
          uploadProgress: null,
        };
      });

      return { successful, failed };
    } catch (err) {
      set({ isUploading: false, uploadProgress: null, error: 'Bulk upload failed' });
      return { successful, failed: [...failed, ...files.slice(successful.length + failed.length).map(f => ({ file: f, error: 'Upload failed' }))] };
    }
  },

  deleteBook: async (id: string) => {
    const supabase = createClient();
    set({ error: null });

    try {
      // Get the book first to delete the files
      const { data: book } = await supabase
        .from('books')
        .select('file_url, cover_url')
        .eq('id', id)
        .single();

      if (book) {
        // Delete book file from storage
        const filePath = isLegacyUrl(book.file_url)
          ? extractPathFromLegacyUrl(book.file_url)
          : book.file_url;
        if (filePath) {
          await supabase.storage.from('books').remove([filePath]);
        }

        // Delete cover from covers bucket if it exists
        if (book.cover_url) {
          const coverPath = isLegacyUrl(book.cover_url)
            ? extractPathFromLegacyUrl(book.cover_url)
            : book.cover_url;
          if (coverPath) {
            // Try covers bucket first (new), then books bucket (legacy)
            await supabase.storage.from('covers').remove([coverPath]);
            await supabase.storage.from('books').remove([coverPath]);
          }
        }
      }

      // Delete book record (cascades to bookmarks, highlights, progress)
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) {
        set({ error: error.message });
        return;
      }

      // Track book deletion
      track({ event: 'book_deleted', properties: { book_id: id } });

      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
      }));
    } catch (err) {
      set({ error: 'Failed to delete book' });
    }
  },

  updateBook: async (id: string, data: Partial<Book>) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('books')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        books: state.books.map((b) =>
          b.id === id ? { ...b, ...data } : b
        ),
        currentBook: state.currentBook?.id === id
          ? { ...state.currentBook, ...data }
          : state.currentBook,
      }));
    }
  },

  clearCurrentBook: () => {
    set({ currentBook: null, isLoadingBook: false, hasFetchedBook: false });
  },

  copyBookToLibrary: async ({ shareLinkId, originalBookId, sourceBook }: CopyBookParams) => {
    const supabase = createClient();
    set({ isCopying: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isCopying: false, error: 'Not authenticated' });
        return { book: null, error: 'Please sign in to add books to your library' };
      }

      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('shared_book_claims')
        .select('new_book_id')
        .eq('share_link_id', shareLinkId)
        .eq('original_book_id', originalBookId)
        .eq('claimed_by_user_id', user.id)
        .single();

      if (existingClaim?.new_book_id) {
        set({ isCopying: false });
        return { book: null, error: 'You have already added this book to your library' };
      }

      // Get the source file path
      const sourceFilePath = isLegacyUrl(sourceBook.file_url)
        ? extractPathFromLegacyUrl(sourceBook.file_url)
        : sourceBook.file_url;

      if (!sourceFilePath) {
        set({ isCopying: false, error: 'Invalid source file' });
        return { book: null, error: 'Invalid source file' };
      }

      // Download the source file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('books')
        .download(sourceFilePath);

      if (downloadError || !fileData) {
        set({ isCopying: false, error: 'Failed to access book file' });
        return { book: null, error: 'Failed to access book file' };
      }

      // Upload to user's folder with new UUID
      const fileId = generateFileId();
      const newFilePath = `${user.id}/${fileId}.${sourceBook.file_type}`;
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(newFilePath, fileData);

      if (uploadError) {
        set({ isCopying: false, error: uploadError.message });
        return { book: null, error: uploadError.message };
      }

      // Copy cover if exists
      let newCoverPath: string | undefined;
      if (sourceBook.cover_url) {
        const sourceCoverPath = isLegacyUrl(sourceBook.cover_url)
          ? extractPathFromLegacyUrl(sourceBook.cover_url)
          : sourceBook.cover_url;

        if (sourceCoverPath) {
          // Try covers bucket first, then books bucket (legacy)
          let coverData = await supabase.storage.from('covers').download(sourceCoverPath);
          if (coverData.error) {
            coverData = await supabase.storage.from('books').download(sourceCoverPath);
          }

          if (coverData.data) {
            const coverExt = sourceCoverPath.split('.').pop() || 'jpg';
            const coverId = generateFileId();
            newCoverPath = `${user.id}/${coverId}.${coverExt}`;

            await supabase.storage
              .from('covers')
              .upload(newCoverPath, coverData.data);
          }
        }
      }

      // Create new book record
      const { data: newBook, error: insertError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: sourceBook.title,
          author: sourceBook.author,
          cover_url: newCoverPath,
          file_url: newFilePath,
          file_type: sourceBook.file_type,
          file_size: sourceBook.file_size,
        })
        .select()
        .single();

      if (insertError) {
        // Cleanup uploaded files on error
        await supabase.storage.from('books').remove([newFilePath]);
        if (newCoverPath) {
          await supabase.storage.from('covers').remove([newCoverPath]);
        }
        set({ isCopying: false, error: insertError.message });
        return { book: null, error: insertError.message };
      }

      // Record the claim
      await supabase
        .from('shared_book_claims')
        .insert({
          share_link_id: shareLinkId,
          original_book_id: originalBookId,
          claimed_by_user_id: user.id,
          new_book_id: newBook.id,
        });

      // Track shared book added to library
      funnels.viral.sharedBookAdded(shareLinkId, newBook.id);

      set((state) => ({
        books: [newBook, ...state.books],
        isCopying: false,
      }));

      return { book: newBook, error: null };
    } catch (err) {
      set({ isCopying: false, error: 'Failed to copy book' });
      return { book: null, error: 'Failed to copy book to your library' };
    }
  },
}));
