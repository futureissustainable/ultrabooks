-- Migration: Share Collections
-- Enables sharing multiple books at once with "Add to Library" capability

-- Create share_links table (replaces shared_books for new shares)
CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  title TEXT,  -- Optional collection name like "My Sci-Fi Favorites"
  include_bookmarks BOOLEAN DEFAULT false,
  include_highlights BOOLEAN DEFAULT false,
  include_notes BOOLEAN DEFAULT false,
  allow_add_to_library BOOLEAN DEFAULT true,  -- Can recipients copy books?
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Junction table for books in a share
CREATE TABLE IF NOT EXISTS share_link_books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(share_link_id, book_id)
);

-- Track when users add shared books to their library
CREATE TABLE IF NOT EXISTS shared_book_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links ON DELETE CASCADE NOT NULL,
  original_book_id UUID REFERENCES books ON DELETE SET NULL,  -- Original book (may be deleted)
  claimed_by_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  new_book_id UUID REFERENCES books ON DELETE SET NULL,  -- The copy in recipient's library
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(share_link_id, original_book_id, claimed_by_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS share_links_share_code_idx ON share_links(share_code);
CREATE INDEX IF NOT EXISTS share_links_user_id_idx ON share_links(user_id);
CREATE INDEX IF NOT EXISTS share_link_books_share_link_id_idx ON share_link_books(share_link_id);
CREATE INDEX IF NOT EXISTS share_link_books_book_id_idx ON share_link_books(book_id);
CREATE INDEX IF NOT EXISTS shared_book_claims_share_link_id_idx ON shared_book_claims(share_link_id);
CREATE INDEX IF NOT EXISTS shared_book_claims_claimed_by_idx ON shared_book_claims(claimed_by_user_id);

-- Enable RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_link_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_book_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_links
CREATE POLICY "Users can view own shares" ON share_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shares" ON share_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares" ON share_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares" ON share_links
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view active, non-expired shares
CREATE POLICY "Public can view active shares" ON share_links
  FOR SELECT USING (is_active = true AND expires_at > NOW());

-- RLS Policies for share_link_books
CREATE POLICY "Users can manage books in own shares" ON share_link_books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM share_links WHERE id = share_link_id AND user_id = auth.uid())
  );

-- Public can view books in active shares
CREATE POLICY "Public can view books in active shares" ON share_link_books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE id = share_link_id AND is_active = true AND expires_at > NOW()
    )
  );

-- RLS Policies for shared_book_claims
CREATE POLICY "Users can view own claims" ON shared_book_claims
  FOR SELECT USING (auth.uid() = claimed_by_user_id);

CREATE POLICY "Users can insert claims for valid shares" ON shared_book_claims
  FOR INSERT WITH CHECK (
    auth.uid() = claimed_by_user_id AND
    EXISTS (
      SELECT 1 FROM share_links
      WHERE id = share_link_id
      AND is_active = true
      AND expires_at > NOW()
      AND allow_add_to_library = true
    )
  );

-- Share owners can view claims on their shares
CREATE POLICY "Share owners can view claims" ON shared_book_claims
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM share_links WHERE id = share_link_id AND user_id = auth.uid())
  );
