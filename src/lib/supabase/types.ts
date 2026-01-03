export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string | null;
          cover_url: string | null;
          file_url: string;
          file_type: 'epub' | 'pdf' | 'mobi';
          file_size: number;
          total_pages: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author?: string | null;
          cover_url?: string | null;
          file_url: string;
          file_type: 'epub' | 'pdf' | 'mobi';
          file_size: number;
          total_pages?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          author?: string | null;
          cover_url?: string | null;
          file_url?: string;
          file_type?: 'epub' | 'pdf' | 'mobi';
          file_size?: number;
          total_pages?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          current_location: string;
          current_page: number | null;
          progress_percentage: number;
          last_read_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          current_location: string;
          current_page?: number | null;
          progress_percentage?: number;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          current_location?: string;
          current_page?: number | null;
          progress_percentage?: number;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          location: string;
          page: number | null;
          title: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          location: string;
          page?: number | null;
          title?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          location?: string;
          page?: number | null;
          title?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      highlights: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          cfi_range: string;
          text: string;
          color: string;
          note: string | null;
          page: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          cfi_range: string;
          text: string;
          color?: string;
          note?: string | null;
          page?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          cfi_range?: string;
          text?: string;
          color?: string;
          note?: string | null;
          page?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'sepia';
          font_family: string;
          font_size: number;
          line_height: number;
          margins: number;
          text_align: 'left' | 'justify';
          content_width: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'sepia';
          font_family?: string;
          font_size?: number;
          line_height?: number;
          margins?: number;
          text_align?: 'left' | 'justify';
          content_width?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'sepia';
          font_family?: string;
          font_size?: number;
          line_height?: number;
          margins?: number;
          text_align?: 'left' | 'justify';
          content_width?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      shared_books: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          share_code: string;
          include_bookmarks: boolean;
          include_highlights: boolean;
          include_notes: boolean;
          is_active: boolean;
          view_count: number;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          share_code: string;
          include_bookmarks?: boolean;
          include_highlights?: boolean;
          include_notes?: boolean;
          is_active?: boolean;
          view_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          share_code?: string;
          include_bookmarks?: boolean;
          include_highlights?: boolean;
          include_notes?: boolean;
          is_active?: boolean;
          view_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_upload_quota: {
        Args: { p_user_id: string };
        Returns: {
          daily_uploads: number;
          total_uploads: number;
          daily_remaining: number;
          total_remaining: number;
          daily_limit: number;
          total_limit: number;
        };
      };
      check_upload_quota: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      increment_upload_count: {
        Args: { p_user_id: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Book = Database['public']['Tables']['books']['Row'];
export type ReadingProgress = Database['public']['Tables']['reading_progress']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type Highlight = Database['public']['Tables']['highlights']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type SharedBook = Database['public']['Tables']['shared_books']['Row'];

// Streak types (stored in localStorage, synced with user_settings)
export interface StreakGoal {
  type: 'pages' | 'minutes';
  target: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  pagesRead: number;
  minutesRead: number;
  goalMet: boolean;
}

export interface StreakData {
  goal: StreakGoal;
  currentStreak: number;
  longestStreak: number;
  todayProgress: DailyProgress;
  history: DailyProgress[];
  lastUpdated: string;
}
