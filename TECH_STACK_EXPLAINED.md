# MEMOROS Tech Stack Explained (Beginner-Friendly Guide)

Welcome! This guide explains how this ebook reader app works. Since you know HTML, CSS, and some JavaScript, I'll build on that knowledge.

---

## Quick Overview

**What is this app?** An ebook reader that lets you:
- Upload and read EPUB, PDF, and MOBI files
- Sync your reading progress across devices
- Create bookmarks and highlights
- Share books with others
- Read offline (like a phone app)

---

## Part 1: The Technologies Used

### 1.1 Next.js (The Framework)

**What you know:** HTML files that the browser opens directly.

**What Next.js does:** It's a tool that takes your code and creates those HTML files automatically. It also adds "superpowers" like:

```
Regular website:           Next.js website:
┌──────────────┐           ┌──────────────┐
│  index.html  │           │  page.tsx    │  ← You write this
│  about.html  │    vs     │  page.tsx    │
│  contact.html│           │  page.tsx    │
└──────────────┘           └──────────────┘
                                  ↓
                           Next.js builds
                                  ↓
                           ┌──────────────┐
                           │  HTML + JS   │  ← Browser gets this
                           └──────────────┘
```

**Why use it?**
- Automatic page routing (folder = URL)
- Fast page loads
- Can run code on the server (more secure)

### 1.2 React (The UI Library)

**What you know:** Writing HTML like `<div class="card"><h1>Title</h1></div>`

**What React does:** Lets you create reusable "components" - think of them like custom HTML tags:

```jsx
// Instead of repeating HTML everywhere...
<div class="book-card">
  <img src="cover1.jpg">
  <h3>Book Title 1</h3>
</div>
<div class="book-card">
  <img src="cover2.jpg">
  <h3>Book Title 2</h3>
</div>

// React lets you create a reusable component:
function BookCard({ cover, title }) {
  return (
    <div className="book-card">
      <img src={cover} />
      <h3>{title}</h3>
    </div>
  );
}

// And use it like this:
<BookCard cover="cover1.jpg" title="Book Title 1" />
<BookCard cover="cover2.jpg" title="Book Title 2" />
```

**The `{ }` braces:** In React, curly braces mean "put JavaScript here". So `{title}` means "insert the value of the title variable".

### 1.3 TypeScript (JavaScript with Safety)

**What you know:** JavaScript variables can be anything:
```javascript
let name = "John";
name = 42;        // JavaScript allows this (can cause bugs!)
```

**What TypeScript does:** Adds "types" to catch errors before they happen:
```typescript
let name: string = "John";
name = 42;        // TypeScript shows ERROR - can't put number in string!
```

**The `.tsx` files:** That's TypeScript + React combined. When you see `.tsx`, it's a React component written in TypeScript.

### 1.4 Tailwind CSS (Styling)

**What you know:** Writing CSS in separate files:
```css
/* styles.css */
.button {
  background-color: blue;
  padding: 10px 20px;
  border-radius: 5px;
}
```

**What Tailwind does:** Lets you style directly in HTML using utility classes:
```html
<!-- Instead of creating custom CSS classes... -->
<button class="bg-blue-500 px-5 py-2 rounded">Click me</button>
```

Each class does ONE thing:
- `bg-blue-500` = background color blue
- `px-5` = padding left/right (x-axis)
- `py-2` = padding top/bottom (y-axis)
- `rounded` = border-radius

### 1.5 Supabase (The Database & Backend)

**What you know:** Websites need a place to store data.

**What Supabase provides:**
1. **Database** - Tables to store books, users, bookmarks, etc.
2. **Authentication** - Login/signup system
3. **File Storage** - Place to store uploaded book files
4. **Real-time sync** - Data updates across devices

Think of it as "Firebase but with a real SQL database".

```
┌─────────────────────────────────────────────────┐
│                   SUPABASE                       │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Database   │  │   Storage   │  │   Auth   │ │
│  │  (Tables)   │  │   (Files)   │  │ (Login)  │ │
│  │             │  │             │  │          │ │
│  │ - users     │  │ - books/    │  │ - signup │ │
│  │ - books     │  │ - covers/   │  │ - login  │ │
│  │ - bookmarks │  │             │  │ - logout │ │
│  │ - highlights│  │             │  │          │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
└─────────────────────────────────────────────────┘
```

### 1.6 Zustand (State Management)

**What you know:** Variables in JavaScript hold data.

**The problem:** In React, when data changes, the page needs to update. But what if multiple components need the same data?

```
Without Zustand:                With Zustand:

┌──────────┐                   ┌─────────────────┐
│  Header  │ ← needs user      │   Zustand Store │
└──────────┘   name            │   { user: ... } │
┌──────────┐                   └────────┬────────┘
│  Sidebar │ ← needs user              │
└──────────┘   name            ┌───────┴───────┐
┌──────────┐                   ↓       ↓       ↓
│  Profile │ ← needs user    Header Sidebar Profile
└──────────┘   name            (all connected!)

(passing data everywhere       (everyone reads from
is messy and error-prone)      one central place)
```

---

## Part 2: Project Structure (The Folders)

```
ultrabooks/
├── src/                    ← All source code lives here
│   ├── app/                ← PAGES (URLs)
│   ├── components/         ← REUSABLE PIECES
│   └── lib/                ← HELPER CODE
├── public/                 ← STATIC FILES (images, fonts)
├── supabase/               ← DATABASE SETUP
└── package.json            ← PROJECT DEPENDENCIES
```

### 2.1 The `src/app/` Folder (Pages)

Next.js uses **folder-based routing**. The folder structure = the URLs:

```
src/app/
├── page.tsx                    → yoursite.com/
├── (auth)/
│   ├── login/page.tsx          → yoursite.com/login
│   └── signup/page.tsx         → yoursite.com/signup
├── (main)/
│   ├── library/page.tsx        → yoursite.com/library
│   ├── reader/[id]/page.tsx    → yoursite.com/reader/abc123
│   └── settings/page.tsx       → yoursite.com/settings
└── share/[code]/page.tsx       → yoursite.com/share/xyz789
```

**Special naming:**
- `page.tsx` = The actual page content
- `layout.tsx` = Wrapper around pages (like a template)
- `[id]` = Dynamic route (the id changes based on which book)
- `(auth)` = Route group (just for organization, doesn't affect URL)

### 2.2 The `src/components/` Folder (Building Blocks)

These are reusable pieces used across multiple pages:

```
components/
├── reader/                 ← Book reading components
│   ├── BookReader.tsx      ← Main reader (chooses format)
│   ├── EpubReader.tsx      ← For EPUB files
│   ├── PdfReader.tsx       ← For PDF files
│   └── ReaderToolbar.tsx   ← The top bar in reader
│
├── library/                ← Book library components
│   ├── BookCard.tsx        ← Single book display
│   ├── BookGrid.tsx        ← Grid of books
│   └── BookUpload.tsx      ← Upload interface
│
├── ui/                     ← Generic UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Input.tsx
│
└── layout/                 ← Site structure
    ├── Header.tsx
    └── Footer.tsx
```

### 2.3 The `src/lib/` Folder (Helper Code)

Code that isn't visual but does important work:

```
lib/
├── supabase/               ← Database connection
│   ├── client.ts           ← Browser-side connection
│   ├── server.ts           ← Server-side connection
│   └── types.ts            ← Data type definitions
│
├── stores/                 ← Zustand state stores
│   ├── auth-store.ts       ← User login state
│   ├── book-store.ts       ← Book library data
│   ├── reader-store.ts     ← Reading settings & progress
│   └── theme-store.ts      ← Dark/light mode
│
└── epub-utils.ts           ← EPUB file processing
```

---

## Part 3: How Data Flows (The Big Picture)

### 3.1 When You Open the App

```
1. Browser loads the app
         ↓
2. AuthProvider checks: "Is user logged in?"
         ↓
   ┌─────┴─────┐
   ↓           ↓
Not logged   Logged in
   ↓           ↓
Show login   Load their books
page         from database
```

**Code location:** `src/components/auth/AuthProvider.tsx`

### 3.2 When You Upload a Book

```
1. You select a file (EPUB/PDF)
         ↓
2. App reads the file metadata
   - For EPUB: Extract title, author, cover image
   - For PDF: Just get file name
         ↓
3. Check quota: "Can this user upload more?"
         ↓
4. Upload file to Supabase Storage
         ↓
5. Create record in database:
   {
     id: "abc123",
     title: "The Great Gatsby",
     author: "F. Scott Fitzgerald",
     file_url: "path/to/file.epub",
     cover_url: "path/to/cover.jpg"
   }
         ↓
6. Update the book list on screen
```

**Code location:** `src/lib/stores/book-store.ts` → `uploadBooks()` function

### 3.3 When You Read a Book

```
1. Click on a book in library
         ↓
2. App navigates to /reader/[book-id]
         ↓
3. BookReader looks at file type:
   - EPUB → Use EpubReader
   - PDF  → Use PdfReader
   - MOBI → Use EpubReader (same engine)
         ↓
4. Download book file from Supabase Storage
         ↓
5. Load last reading position from database
         ↓
6. Render the book content on screen
         ↓
7. As you read, save progress every few seconds:
   - Save to localStorage (instant, works offline)
   - Save to database (syncs across devices)
```

**Code locations:**
- `src/app/(main)/reader/[id]/page.tsx`
- `src/components/reader/BookReader.tsx`
- `src/lib/stores/reader-store.ts`

### 3.4 When You Create a Bookmark

```
1. Click "Add Bookmark" button
         ↓
2. Get current location in book:
   - EPUB: CFI (special format like "epubcfi(/6/4[chapter1]!/2/4)")
   - PDF: Page number
         ↓
3. Create bookmark record:
   {
     book_id: "abc123",
     location: "epubcfi(...)",
     title: "Chapter 5",
     note: "Important quote here"
   }
         ↓
4. Save to database
         ↓
5. Update bookmarks list on screen
```

**Code location:** `src/lib/stores/reader-store.ts` → `addBookmark()` function

---

## Part 4: Understanding the Code (Examples)

### 4.1 A Simple React Component

Let's look at a simplified BookCard component:

```tsx
// src/components/library/BookCard.tsx

// These are like "imports" in other languages
import { Book } from '@/lib/supabase/types';

// The "interface" defines what data this component needs
interface BookCardProps {
  book: Book;           // The book object
  onClick: () => void;  // Function to call when clicked
}

// The component itself - a function that returns HTML-like code (JSX)
export function BookCard({ book, onClick }: BookCardProps) {
  return (
    // className is like "class" in HTML (React uses className)
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer"
      onClick={onClick}
    >
      {/* If book has a cover, show it */}
      {book.cover_url && (
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Book info */}
      <h3 className="font-bold mt-2">{book.title}</h3>
      <p className="text-gray-600">{book.author}</p>
    </div>
  );
}
```

**Key things to notice:**
- `{ book, onClick }` - These are "props" (properties) passed to the component
- `{book.title}` - Curly braces insert JavaScript values
- `{book.cover_url && (...)}` - Shows the image only IF cover_url exists
- `className` instead of `class` (React requirement)
- The Tailwind classes like `bg-white`, `rounded-lg`, `p-4`

### 4.2 A Zustand Store (State Management)

Here's a simplified version of the theme store:

```typescript
// src/lib/stores/theme-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define what data the store holds
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Create the store
export const useThemeStore = create<ThemeState>()(
  // "persist" saves to localStorage automatically
  persist(
    (set) => ({
      // Initial value
      theme: 'system',

      // Function to change the theme
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);
```

**How to use it in a component:**

```tsx
function ThemeToggle() {
  // Get current theme and the function to change it
  const { theme, setTheme } = useThemeStore();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {theme}
    </button>
  );
}
```

### 4.3 Fetching Data from Supabase

```typescript
// Simplified example from book-store.ts

import { supabase } from '@/lib/supabase/client';

async function fetchUserBooks() {
  // Query the database
  const { data, error } = await supabase
    .from('books')                    // Which table
    .select('*')                      // Get all columns
    .order('created_at', {            // Sort by date
      ascending: false
    });

  if (error) {
    console.error('Failed to fetch books:', error);
    return [];
  }

  return data;  // Array of book objects
}
```

This is similar to SQL:
```sql
SELECT * FROM books ORDER BY created_at DESC;
```

---

## Part 5: The Database (Tables)

Think of the database like Excel spreadsheets. Here are the main "tables":

### 5.1 Users Table (profiles)
| id | email | display_name | created_at |
|----|-------|--------------|------------|
| abc123 | john@email.com | John | 2024-01-15 |

### 5.2 Books Table
| id | user_id | title | author | file_url | cover_url |
|----|---------|-------|--------|----------|-----------|
| book1 | abc123 | The Great Gatsby | F. Scott Fitzgerald | /books/abc123/file.epub | /covers/book1.jpg |

### 5.3 Reading Progress Table
| id | user_id | book_id | current_page | progress_percentage | last_read_at |
|----|---------|---------|--------------|---------------------|--------------|
| prog1 | abc123 | book1 | 45 | 23.5 | 2024-01-20 |

### 5.4 Bookmarks Table
| id | user_id | book_id | location | title | note |
|----|---------|---------|----------|-------|------|
| bm1 | abc123 | book1 | epubcfi(/6/4...) | Chapter 3 | Remember this! |

---

## Part 6: How Pages Connect to Everything

Here's the full picture of a page:

```
┌─────────────────────────────────────────────────────────────┐
│                     Library Page                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 1. PAGE COMPONENT (src/app/(main)/library/page.tsx)     │ │
│  │    - Renders the page layout                            │ │
│  │    - Uses components from /components                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 2. COMPONENTS                                           │ │
│  │    - BookGrid: Displays books in a grid                 │ │
│  │    - BookCard: Individual book display                  │ │
│  │    - BookUpload: Upload button & modal                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 3. ZUSTAND STORES                                       │ │
│  │    - book-store: Provides books data                    │ │
│  │    - auth-store: Provides user info                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 4. SUPABASE                                             │ │
│  │    - Database: books, profiles tables                   │ │
│  │    - Storage: Book files and covers                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 7: Key Concepts Explained Simply

### 7.1 What is "State"?

State is data that can change and affects what you see.

```
NOT State:              IS State:
- Your email address    - Which page you're on
- The app logo          - Is the menu open?
- Button labels         - Which book are you reading?
                        - Dark mode on/off?
```

When state changes, React updates the screen automatically.

### 7.2 What is a "Hook"?

Hooks are special React functions that start with `use`:

```tsx
// Built-in hooks:
const [count, setCount] = useState(0);     // Store data
const buttonRef = useRef(null);            // Reference DOM element

// Custom hooks (from this app):
const { user } = useAuthStore();           // Get user from auth store
const { books } = useBookStore();          // Get books from book store
```

### 7.3 What is "async/await"?

When your code needs to wait for something (like fetching from database):

```typescript
// Without async/await (harder to read):
fetchBooks().then(books => {
  console.log(books);
}).catch(error => {
  console.error(error);
});

// With async/await (easier to read):
async function loadBooks() {
  try {
    const books = await fetchBooks();  // Wait here until done
    console.log(books);
  } catch (error) {
    console.error(error);
  }
}
```

### 7.4 What are "Props"?

Props are how you pass data to components:

```tsx
// Parent component passes props:
<BookCard
  title="The Great Gatsby"
  author="F. Scott Fitzgerald"
  onClick={handleClick}
/>

// Child component receives props:
function BookCard({ title, author, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      <p>{author}</p>
    </div>
  );
}
```

---

## Part 8: File-by-File Guide (Important Files)

### 8.1 Entry Point: `src/app/layout.tsx`
- Wraps the entire app
- Sets up providers (auth, theme)
- Includes global CSS

### 8.2 Landing Page: `src/app/page.tsx`
- The homepage at yoursite.com/
- Shows features, hero section
- Has login/signup buttons

### 8.3 Library Page: `src/app/(main)/library/page.tsx`
- Shows all your uploaded books
- Uses BookGrid and BookCard components
- Has upload functionality

### 8.4 Reader Page: `src/app/(main)/reader/[id]/page.tsx`
- Displays the book reader
- Uses BookReader component
- Handles loading book data

### 8.5 Auth Store: `src/lib/stores/auth-store.ts`
- Manages login/logout
- Stores user information
- Handles signup

### 8.6 Book Store: `src/lib/stores/book-store.ts`
- Manages book library
- Handles uploads
- Handles deletions

### 8.7 Reader Store: `src/lib/stores/reader-store.ts`
- Reading settings (font, size, theme)
- Progress tracking
- Bookmarks and highlights

---

## Part 9: Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
#    Create a .env.local file with:
#    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

---

## Part 10: Learning Path Suggestion

If you want to understand this codebase deeply, learn in this order:

1. **React Basics** - Components, props, state, hooks
2. **TypeScript Basics** - Types, interfaces
3. **Next.js App Router** - Pages, layouts, routing
4. **Tailwind CSS** - Utility classes
5. **Zustand** - State management
6. **Supabase** - Database, auth, storage

**Free Resources:**
- React: react.dev/learn
- Next.js: nextjs.org/docs
- TypeScript: typescriptlang.org/docs
- Tailwind: tailwindcss.com/docs
- Supabase: supabase.com/docs

---

## Quick Reference: File Extensions

| Extension | What it is |
|-----------|------------|
| `.tsx` | TypeScript + React (components with UI) |
| `.ts` | TypeScript only (logic, no UI) |
| `.css` | Stylesheet |
| `.json` | Data/configuration file |
| `.sql` | Database commands |
| `.md` | Documentation (like this file!) |

---

## Quick Reference: Common Patterns in This Codebase

```tsx
// 1. Getting data from a store
const { books, fetchBooks } = useBookStore();

// 2. Effect that runs on page load
useEffect(() => {
  fetchBooks();
}, []);

// 3. Conditional rendering
{isLoading ? <Spinner /> : <BookGrid books={books} />}

// 4. Mapping over arrays
{books.map(book => (
  <BookCard key={book.id} book={book} />
))}

// 5. Event handlers
const handleClick = () => {
  console.log('Clicked!');
};
<button onClick={handleClick}>Click me</button>

// 6. Async data fetching
const loadData = async () => {
  setLoading(true);
  const data = await fetchFromDatabase();
  setBooks(data);
  setLoading(false);
};
```

---

That's the complete overview! Start by reading the files in `/src/app/` to see how pages work, then look at `/src/components/` to see the building blocks, and finally `/src/lib/stores/` to understand how data flows.

Happy learning! 🎉
