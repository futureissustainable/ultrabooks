import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Book } from '@/lib/supabase/types';
import { extractEpubCover, extractEpubMetadata } from '@/lib/epub-utils';

interface BookState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  isLoadingBook: boolean;
  isUploading: boolean;
  error: string | null;
  hasFetched: boolean; // Track if we've attempted to fetch library
  hasFetchedBook: boolean; // Track if we've attempted to fetch current book
  fetchBooks: () => Promise<void>;
  fetchBook: (id: string) => Promise<void>;
  uploadBook: (file: File) => Promise<{ book: Book | null; error: string | null }>;
  deleteBook: (id: string) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  clearCurrentBook: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  isLoading: false,
  isLoadingBook: false,
  isUploading: false,
  error: null,
  hasFetched: false,
  hasFetchedBook: false,

  fetchBooks: async () => {
    // Prevent duplicate fetches
    if (get().isLoading) return;

    const supabase = createClient();
    set({ isLoading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false, hasFetched: true, error: null, books: [] });
        return;
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        set({ isLoading: false, hasFetched: true, error: error.message });
        return;
      }

      set({ books: data || [], isLoading: false, hasFetched: true });
    } catch (err) {
      set({ isLoading: false, hasFetched: true, error: 'Failed to fetch books' });
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

  uploadBook: async (file: File) => {
    const supabase = createClient();
    set({ isUploading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isUploading: false, error: 'Not authenticated' });
        return { book: null, error: 'Not authenticated' };
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

      // Upload file to storage
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, file);

      if (uploadError) {
        set({ isUploading: false, error: uploadError.message });
        return { book: null, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);

      // Extract title from filename (fallback)
      let title = file.name.replace(/\.(epub|pdf|mobi)$/i, '');
      let author: string | undefined;
      let coverUrl: string | undefined;

      // For EPUBs, try to extract cover and metadata
      if (fileType === 'epub') {
        try {
          // Extract metadata (title, author)
          const metadata = await extractEpubMetadata(file);
          if (metadata.title) {
            title = metadata.title;
          }
          if (metadata.author) {
            author = metadata.author;
          }

          // Extract and upload cover
          const coverBlob = await extractEpubCover(file);
          if (coverBlob) {
            const coverExt = coverBlob.type.split('/')[1] || 'jpg';
            const coverPath = `${user.id}/covers/${timestamp}-cover.${coverExt}`;

            const { error: coverUploadError } = await supabase.storage
              .from('books')
              .upload(coverPath, coverBlob, {
                contentType: coverBlob.type,
              });

            if (!coverUploadError) {
              const { data: coverUrlData } = supabase.storage
                .from('books')
                .getPublicUrl(coverPath);
              coverUrl = coverUrlData.publicUrl;
            }
          }
        } catch (epubError) {
          console.error('Error processing EPUB:', epubError);
          // Continue without cover/metadata - not a critical error
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
          file_url: urlData.publicUrl,
          file_type: fileType,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) {
        set({ isUploading: false, error: insertError.message });
        return { book: null, error: insertError.message };
      }

      set((state) => ({
        books: [book, ...state.books],
        isUploading: false,
      }));

      return { book, error: null };
    } catch (err) {
      set({ isUploading: false, error: 'Upload failed' });
      return { book: null, error: 'Upload failed' };
    }
  },

  deleteBook: async (id: string) => {
    const supabase = createClient();
    set({ error: null });

    try {
      // Get the book first to delete the file
      const { data: book } = await supabase
        .from('books')
        .select('file_url')
        .eq('id', id)
        .single();

      if (book) {
        // Extract file path from URL and delete from storage
        const url = new URL(book.file_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/books\/(.+)/);
        if (pathMatch) {
          await supabase.storage.from('books').remove([pathMatch[1]]);
        }
      }

      // Delete book record (cascades to bookmarks, highlights, progress)
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) {
        set({ error: error.message });
        return;
      }

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
}));
