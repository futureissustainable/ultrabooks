import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SharedBook, Book, Bookmark, Highlight } from '@/lib/supabase/types';

interface ShareOptions {
  includeBookmarks: boolean;
  includeHighlights: boolean;
  includeNotes: boolean;
  expiresInHours?: number;
}

interface CollectionShareOptions extends ShareOptions {
  title?: string;  // Optional collection name
  allowAddToLibrary?: boolean;  // Can recipients copy books?
}

interface SharedBookData {
  share: SharedBook;
  book: Book;
  bookmarks?: Bookmark[];
  highlights?: Highlight[];
}

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
  updated_at: string;
}

interface SharedCollectionData {
  shareLink: ShareLink;
  books: Book[];
  bookmarks?: Record<string, Bookmark[]>;  // Keyed by book ID
  highlights?: Record<string, Highlight[]>;  // Keyed by book ID
}

interface ShareState {
  shares: SharedBook[];
  shareLinks: ShareLink[];  // Collection shares
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  fetchShares: () => Promise<void>;
  createShare: (bookId: string, options: ShareOptions) => Promise<{ shareCode: string | null; error: string | null }>;
  createCollectionShare: (bookIds: string[], options: CollectionShareOptions) => Promise<{ shareCode: string | null; error: string | null }>;
  deleteShare: (shareId: string) => Promise<void>;
  toggleShareActive: (shareId: string, isActive: boolean) => Promise<void>;
  getShareByCode: (shareCode: string) => Promise<SharedBookData | null>;
  getCollectionByCode: (shareCode: string) => Promise<SharedCollectionData | null>;
}

// Generate a random share code
const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useShareStore = create<ShareState>((set) => ({
  shares: [],
  shareLinks: [],
  isLoading: false,
  isCreating: false,
  error: null,

  fetchShares: async () => {
    const supabase = createClient();
    set({ isLoading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false, error: 'Not authenticated' });
        return;
      }

      const { data, error } = await supabase
        .from('shared_books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      set({ shares: data || [], isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to fetch shares' });
    }
  },

  createShare: async (bookId: string, options: ShareOptions) => {
    const supabase = createClient();
    set({ isCreating: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isCreating: false, error: 'Not authenticated' });
        return { shareCode: null, error: 'Not authenticated' };
      }

      // Check if share already exists for this book
      const { data: existingShare } = await supabase
        .from('shared_books')
        .select('share_code')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existingShare) {
        set({ isCreating: false });
        return { shareCode: existingShare.share_code, error: null };
      }

      const shareCode = generateShareCode();
      // Default to 24 hours if not specified
      const expiresInHours = options.expiresInHours || 24;
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('shared_books')
        .insert({
          book_id: bookId,
          user_id: user.id,
          share_code: shareCode,
          include_bookmarks: options.includeBookmarks,
          include_highlights: options.includeHighlights,
          include_notes: options.includeNotes,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        set({ isCreating: false, error: error.message });
        return { shareCode: null, error: error.message };
      }

      set((state) => ({
        shares: [data, ...state.shares],
        isCreating: false,
      }));

      return { shareCode: data.share_code, error: null };
    } catch {
      set({ isCreating: false, error: 'Failed to create share' });
      return { shareCode: null, error: 'Failed to create share' };
    }
  },

  deleteShare: async (shareId: string) => {
    const supabase = createClient();
    set({ error: null });

    try {
      const { error } = await supabase
        .from('shared_books')
        .delete()
        .eq('id', shareId);

      if (error) {
        set({ error: error.message });
        return;
      }

      set((state) => ({
        shares: state.shares.filter((s) => s.id !== shareId),
      }));
    } catch {
      set({ error: 'Failed to delete share' });
    }
  },

  toggleShareActive: async (shareId: string, isActive: boolean) => {
    const supabase = createClient();
    set({ error: null });

    try {
      const { error } = await supabase
        .from('shared_books')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', shareId);

      if (error) {
        set({ error: error.message });
        return;
      }

      set((state) => ({
        shares: state.shares.map((s) =>
          s.id === shareId ? { ...s, is_active: isActive } : s
        ),
      }));
    } catch {
      set({ error: 'Failed to update share' });
    }
  },

  getShareByCode: async (shareCode: string): Promise<SharedBookData | null> => {
    const supabase = createClient();

    try {
      // Get share details
      const { data: share, error: shareError } = await supabase
        .from('shared_books')
        .select('*')
        .eq('share_code', shareCode)
        .eq('is_active', true)
        .single();

      if (shareError || !share) {
        return null;
      }

      // Check expiry
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return null;
      }

      // Get book details
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', share.book_id)
        .single();

      if (bookError || !book) {
        return null;
      }

      const result: SharedBookData = { share, book };

      // Get bookmarks if included
      if (share.include_bookmarks) {
        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('book_id', share.book_id)
          .eq('user_id', share.user_id)
          .order('created_at', { ascending: true });

        result.bookmarks = bookmarks || [];
      }

      // Get highlights if included
      if (share.include_highlights) {
        const { data: highlights } = await supabase
          .from('highlights')
          .select('*')
          .eq('book_id', share.book_id)
          .eq('user_id', share.user_id)
          .order('created_at', { ascending: true });

        result.highlights = highlights || [];
      }

      // Increment view count
      await supabase
        .from('shared_books')
        .update({ view_count: share.view_count + 1 })
        .eq('id', share.id);

      return result;
    } catch {
      return null;
    }
  },

  createCollectionShare: async (bookIds: string[], options: CollectionShareOptions) => {
    const supabase = createClient();
    set({ isCreating: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isCreating: false, error: 'Not authenticated' });
        return { shareCode: null, error: 'Not authenticated' };
      }

      if (bookIds.length === 0) {
        set({ isCreating: false, error: 'No books selected' });
        return { shareCode: null, error: 'No books selected' };
      }

      const shareCode = generateShareCode();
      const expiresInHours = options.expiresInHours || 24;
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

      // Create the share link
      const { data: shareLink, error: shareLinkError } = await supabase
        .from('share_links')
        .insert({
          user_id: user.id,
          share_code: shareCode,
          title: options.title || null,
          include_bookmarks: options.includeBookmarks,
          include_highlights: options.includeHighlights,
          include_notes: options.includeNotes,
          allow_add_to_library: options.allowAddToLibrary !== false,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (shareLinkError || !shareLink) {
        set({ isCreating: false, error: shareLinkError?.message || 'Failed to create share' });
        return { shareCode: null, error: shareLinkError?.message || 'Failed to create share' };
      }

      // Add books to the share
      const bookEntries = bookIds.map(bookId => ({
        share_link_id: shareLink.id,
        book_id: bookId,
      }));

      const { error: booksError } = await supabase
        .from('share_link_books')
        .insert(bookEntries);

      if (booksError) {
        // Rollback: delete the share link
        await supabase.from('share_links').delete().eq('id', shareLink.id);
        set({ isCreating: false, error: booksError.message });
        return { shareCode: null, error: booksError.message };
      }

      set((state) => ({
        shareLinks: [shareLink as ShareLink, ...state.shareLinks],
        isCreating: false,
      }));

      return { shareCode: shareLink.share_code, error: null };
    } catch {
      set({ isCreating: false, error: 'Failed to create collection share' });
      return { shareCode: null, error: 'Failed to create collection share' };
    }
  },

  getCollectionByCode: async (shareCode: string): Promise<SharedCollectionData | null> => {
    const supabase = createClient();

    try {
      // Get share link details
      const { data: shareLink, error: shareLinkError } = await supabase
        .from('share_links')
        .select('*')
        .eq('share_code', shareCode)
        .eq('is_active', true)
        .single();

      if (shareLinkError || !shareLink) {
        return null;
      }

      // Check expiry
      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        return null;
      }

      // Get book IDs from junction table
      const { data: bookLinks, error: bookLinksError } = await supabase
        .from('share_link_books')
        .select('book_id')
        .eq('share_link_id', shareLink.id);

      if (bookLinksError || !bookLinks || bookLinks.length === 0) {
        return null;
      }

      const bookIds = bookLinks.map(bl => bl.book_id);

      // Get book details
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds);

      if (booksError || !books || books.length === 0) {
        return null;
      }

      const result: SharedCollectionData = {
        shareLink: shareLink as ShareLink,
        books: books as Book[],
      };

      // Get bookmarks for all books if included
      if (shareLink.include_bookmarks) {
        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', shareLink.user_id)
          .in('book_id', bookIds)
          .order('created_at', { ascending: true });

        if (bookmarks) {
          result.bookmarks = bookmarks.reduce((acc, bm) => {
            if (!acc[bm.book_id]) acc[bm.book_id] = [];
            acc[bm.book_id].push(bm);
            return acc;
          }, {} as Record<string, Bookmark[]>);
        }
      }

      // Get highlights for all books if included
      if (shareLink.include_highlights) {
        const { data: highlights } = await supabase
          .from('highlights')
          .select('*')
          .eq('user_id', shareLink.user_id)
          .in('book_id', bookIds)
          .order('created_at', { ascending: true });

        if (highlights) {
          result.highlights = highlights.reduce((acc, hl) => {
            if (!acc[hl.book_id]) acc[hl.book_id] = [];
            acc[hl.book_id].push(hl);
            return acc;
          }, {} as Record<string, Highlight[]>);
        }
      }

      // Increment view count
      await supabase
        .from('share_links')
        .update({ view_count: shareLink.view_count + 1 })
        .eq('id', shareLink.id);

      return result;
    } catch {
      return null;
    }
  },
}));
