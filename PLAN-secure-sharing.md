# Secure Sharing Feature Plan

## Overview

Redesign the sharing system with:
1. **Private storage** - Bucket becomes private, files accessed via signed URLs
2. **Configurable expiry** - Share links expire in 1-24 hours (user selects)
3. **Multi-book sharing** - Share multiple books or entire library at once
4. **"Add to Library"** - Recipients can permanently copy shared books to their own library

---

## Part 1: Private Bucket + Signed URLs

### Problem
Currently using public bucket with `getPublicUrl()` - anyone who guesses the path can access files.

### Solution

#### 1.1 Database Changes
Store file **paths** (not full URLs) in the database. Generate signed URLs on-demand.

```sql
-- No schema change needed, but stored values change:
-- Before: file_url = "https://xxx.supabase.co/storage/v1/object/public/books/user123/file.epub"
-- After:  file_url = "user123/abc123.epub" (just the path)
```

#### 1.2 New Utility: `createSignedUrl()`

**File:** `src/lib/supabase/storage.ts` (new)

```typescript
export async function getSignedUrl(filePath: string, expiresIn: number = 900): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from('books')
    .createSignedUrl(filePath, expiresIn);

  if (error) return null;
  return data.signedUrl;
}

export async function getSignedUrls(filePaths: string[], expiresIn: number = 900): Promise<Map<string, string>> {
  // Batch generate signed URLs for multiple files
}
```

#### 1.3 Upload Changes

**File:** `src/lib/stores/book-store.ts`

- Change file path from `${user.id}/${timestamp}-${filename}` to `${user.id}/${uuid}.${ext}`
- Store only the **path** in `file_url`, not full public URL
- Same for `cover_url`

#### 1.4 Reader Changes

**Files:**
- `src/components/reader/EpubReader.tsx`
- `src/components/reader/PdfReader.tsx`
- `src/components/reader/MobiReader.tsx`

- Before rendering, call `getSignedUrl(book.file_url)` to get a temporary URL
- URL expires in 15 minutes (enough to load the book)
- If URL expires during reading, regenerate on next interaction

#### 1.5 Cover Image Changes

**Files:**
- `src/components/library/BookCard.tsx`
- `src/components/library/BookRow.tsx`

Options:
- **Option A:** Generate signed URLs for covers (adds latency)
- **Option B:** Keep covers in separate public bucket (simpler, covers aren't sensitive)
- **Recommended:** Option B - create `covers` bucket (public), `books` bucket (private)

#### 1.6 Manual Step (Dashboard)
User must:
1. Create new bucket `covers` (public) - for cover images
2. Change `books` bucket to private
3. Enable storage RLS policies

---

## Part 2: Enhanced Share Link Expiry

### Current State
- `expiresInDays` option exists but UI doesn't expose it
- Stored in `expires_at` column

### Changes

#### 2.1 Update ShareModal UI

**File:** `src/components/library/ShareModal.tsx`

Add expiry selector:
```
┌─────────────────────────────────────┐
│ Link expires in:                    │
│ ┌─────────────────────────────────┐ │
│ │ ○ 1 hour                        │ │
│ │ ○ 6 hours                       │ │
│ │ ○ 12 hours                      │ │
│ │ ○ 24 hours (max)                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 2.2 Update ShareOptions Interface

**File:** `src/lib/stores/share-store.ts`

```typescript
interface ShareOptions {
  includeBookmarks: boolean;
  includeHighlights: boolean;
  includeNotes: boolean;
  expiresInHours: number;  // Changed from expiresInDays
}
```

#### 2.3 Show Expiry on Share Page

**File:** `src/app/share/[code]/page.tsx`

Display countdown: "This link expires in X hours"

---

## Part 3: Multi-Book & Library Sharing

### New Concept: "Share Collection"
Instead of sharing one book, share a **collection** (1 or more books).

#### 3.1 Database Schema

**New migration:** `20241231_share_collections.sql`

```sql
-- Rename shared_books → share_links (the share itself)
-- Create share_link_books (junction table for books in share)

CREATE TABLE share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  title TEXT,  -- Optional name like "My Sci-Fi Collection"
  include_bookmarks BOOLEAN DEFAULT false,
  include_highlights BOOLEAN DEFAULT false,
  include_notes BOOLEAN DEFAULT false,
  allow_add_to_library BOOLEAN DEFAULT true,  -- NEW: can recipients copy?
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE share_link_books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  share_link_id UUID REFERENCES share_links ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books ON DELETE CASCADE NOT NULL,
  UNIQUE(share_link_id, book_id)
);

-- RLS policies...
```

#### 3.2 Multi-Select UI in Library

**File:** `src/components/library/LibraryGrid.tsx` (or new component)

Add selection mode:
```
┌─────────────────────────────────────────────────────┐
│ [Select] [Share Selected (3)] [Cancel]              │
├─────────────────────────────────────────────────────┤
│ ☑ Book 1    ☑ Book 2    ☐ Book 3    ☑ Book 4       │
│ ☐ Book 5    ☐ Book 6    ☐ Book 7    ☐ Book 8       │
└─────────────────────────────────────────────────────┘
```

Also add "Share Entire Library" button.

#### 3.3 New ShareCollectionModal

**File:** `src/components/library/ShareCollectionModal.tsx` (new)

```
┌─────────────────────────────────────────────────────┐
│ Share 5 Books                                       │
├─────────────────────────────────────────────────────┤
│ Collection name (optional):                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ My Favorites                                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Books included:                                     │
│ • The Great Gatsby                                  │
│ • 1984                                              │
│ • Dune                                              │
│ • + 2 more                                          │
│                                                     │
│ Link expires in:                                    │
│ [1 hour ▼]                                          │
│                                                     │
│ ☑ Include bookmarks                                 │
│ ☑ Include highlights                                │
│ ☐ Include notes                                     │
│ ☑ Allow recipients to add to their library          │
│                                                     │
│ [Cancel]                    [Create Share Link]     │
└─────────────────────────────────────────────────────┘
```

#### 3.4 Update share-store.ts

Add new functions:
```typescript
createCollectionShare(bookIds: string[], options: CollectionShareOptions)
getCollectionByCode(shareCode: string): Promise<SharedCollectionData>
```

---

## Part 4: "Add to Library" Feature

### Concept
When a logged-in user opens a share link, they can click "Add to Library" to:
1. Copy the book file to their own storage folder
2. Create a new book record owned by them
3. Optionally copy bookmarks/highlights

#### 4.1 Share Page Updates

**File:** `src/app/share/[code]/page.tsx`

For logged-in users, show:
```
┌─────────────────────────────────────────────────────┐
│ [Book Cover]  The Great Gatsby                      │
│               by F. Scott Fitzgerald                │
│                                                     │
│               ┌───────────────────────┐             │
│               │ + Add to My Library   │             │
│               └───────────────────────┘             │
│                                                     │
│ This link expires in 5 hours                        │
└─────────────────────────────────────────────────────┘
```

For collections:
```
┌─────────────────────────────────────────────────────┐
│ Shared Collection: "Sci-Fi Essentials"              │
│ 5 books shared by @username                         │
│                                                     │
│ ☑ Dune                    [Add]                     │
│ ☑ Foundation              [Add]                     │
│ ☑ Neuromancer             [Add]                     │
│ ☐ 1984                    [Already in library]      │
│ ☑ Brave New World         [Add]                     │
│                                                     │
│ [Add Selected (4) to Library]                       │
└─────────────────────────────────────────────────────┘
```

#### 4.2 Backend: Copy Book Function

**File:** `src/lib/stores/book-store.ts` (or new `src/lib/actions/copy-book.ts`)

```typescript
async function addSharedBookToLibrary(
  shareCode: string,
  bookId: string,
  options: { copyBookmarks: boolean; copyHighlights: boolean }
): Promise<{ book: Book | null; error: string | null }> {
  // 1. Verify share is valid and not expired
  // 2. Verify book is in the share
  // 3. Verify allow_add_to_library is true
  // 4. Check user doesn't already have this book (by file hash or title+author)
  // 5. Copy file from owner's folder to recipient's folder in storage
  // 6. Create new book record for recipient
  // 7. Optionally copy bookmarks/highlights
  // 8. Return new book
}
```

#### 4.3 Storage Copy Operation

Supabase doesn't have a native "copy" operation. Options:

**Option A: Download and re-upload (simple but bandwidth-heavy)**
```typescript
const { data } = await supabase.storage.from('books').download(sourcePath);
await supabase.storage.from('books').upload(destPath, data);
```

**Option B: Server-side copy via Edge Function (better)**
```typescript
// Edge function with service role can copy directly
```

**Recommended:** Option A for simplicity. Files are downloaded to user's browser then re-uploaded to their folder. Works, just uses bandwidth.

#### 4.4 Prevent Duplicates

Before copying, check if user already has the book:
- Compare file hash (if stored)
- Or compare title + author + file_size
- Show "Already in library" instead of "Add" button

---

## Part 5: Implementation Order

### Phase 1: Security Foundation (Do First)
1. Create `src/lib/supabase/storage.ts` with signed URL helpers
2. Update `book-store.ts` upload to use UUID paths and store paths only
3. Update readers to generate signed URLs before loading
4. Separate covers into public bucket OR generate signed URLs for covers
5. **Manual:** User flips bucket to private in dashboard

### Phase 2: Enhanced Expiry
1. Add expiry selector to ShareModal
2. Update share-store to use hours instead of days
3. Show expiry countdown on share page

### Phase 3: Multi-Book Sharing
1. Add database migration for share_links + share_link_books
2. Add selection mode to library grid
3. Create ShareCollectionModal
4. Update share-store with collection functions
5. Update share page to handle collections

### Phase 4: Add to Library
1. Add "Add to Library" button on share page
2. Implement copy-book function
3. Handle collections (add selected books)
4. Add duplicate detection

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `src/lib/supabase/storage.ts` | **NEW** - Signed URL helpers |
| `src/lib/stores/book-store.ts` | MODIFY - UUID paths, store paths not URLs |
| `src/lib/stores/share-store.ts` | MODIFY - Hours expiry, collection support |
| `src/components/reader/EpubReader.tsx` | MODIFY - Use signed URLs |
| `src/components/reader/PdfReader.tsx` | MODIFY - Use signed URLs |
| `src/components/reader/MobiReader.tsx` | MODIFY - Use signed URLs |
| `src/components/library/BookCard.tsx` | MODIFY - Signed URLs for covers (or use public bucket) |
| `src/components/library/BookRow.tsx` | MODIFY - Same |
| `src/components/library/ShareModal.tsx` | MODIFY - Add expiry selector |
| `src/components/library/ShareCollectionModal.tsx` | **NEW** - Multi-book share modal |
| `src/components/library/LibraryGrid.tsx` | MODIFY - Add selection mode |
| `src/app/share/[code]/page.tsx` | MODIFY - Collection view, Add to Library |
| `supabase/migrations/xxx_share_collections.sql` | **NEW** - Schema changes |

---

## Questions to Decide Before Implementation

1. **Covers:** Separate public bucket OR signed URLs for everything?
   - Separate bucket = simpler, faster loading
   - All signed = more consistent security

2. **Copy mechanism:** Client-side download/upload OR Edge Function?
   - Client-side = simpler, no extra infrastructure
   - Edge Function = more efficient, less bandwidth

3. **Duplicate detection:** By file hash OR title+author+size?
   - Hash = accurate but need to compute/store
   - Title+author+size = good enough, already have data

4. **Migration:** What about existing books with full public URLs?
   - Need migration script to extract paths from URLs
   - OR support both formats during transition

---

## Security Summary

| Before | After |
|--------|-------|
| Public bucket | Private bucket |
| Permanent URLs | 15-min signed URLs |
| Guessable paths | UUID paths |
| No expiry on shares | 1-24 hour max |
| Share = view only | Share = optional transfer |

**Result:** 95% problem solved, $0 extra cost
