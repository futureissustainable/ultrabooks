import { create } from 'zustand';
import type { ClassicBook } from '@/components/library/BookRow';
import { classicBooks } from '@/lib/classics-data';

interface LocalClassicBook {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  download_url: string;
  description?: string;
  cachedAt: number;
  fileSize: number;
}

interface ClassicBookState {
  // Local cache of classic books
  cachedClassics: Map<string, LocalClassicBook>;
  // Currently loading book IDs
  loadingBooks: Set<string>;
  // Current book being read
  currentClassic: ClassicBook | null;
  // Current book file blob
  currentClassicBlob: Blob | null;

  // Actions
  loadCachedClassics: () => Promise<void>;
  fetchAndCacheClassic: (book: ClassicBook) => Promise<Blob | null>;
  getCachedClassicBlob: (bookId: string) => Promise<Blob | null>;
  isClassicCached: (bookId: string) => boolean;
  isClassicLoading: (bookId: string) => boolean;
  setCurrentClassic: (book: ClassicBook | null) => void;
  clearCurrentClassic: () => void;
  getClassicById: (id: string) => ClassicBook | undefined;
}

// IndexedDB configuration
const DB_NAME = 'ultrabooks-classics';
const DB_VERSION = 1;
const BOOKS_STORE = 'classic-books';
const FILES_STORE = 'classic-files';

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Store for cached book metadata
      if (!database.objectStoreNames.contains(BOOKS_STORE)) {
        database.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }

      // Store for book file blobs
      if (!database.objectStoreNames.contains(FILES_STORE)) {
        database.createObjectStore(FILES_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function saveClassicMeta(book: LocalClassicBook): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BOOKS_STORE, 'readwrite');
    const store = transaction.objectStore(BOOKS_STORE);
    const request = store.put(book);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function saveClassicFile(id: string, blob: Blob): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, 'readwrite');
    const store = transaction.objectStore(FILES_STORE);
    const request = store.put({ id, blob });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getClassicFile(id: string): Promise<Blob | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, 'readonly');
    const store = transaction.objectStore(FILES_STORE);
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result?.blob || null);
    };
  });
}

async function getAllClassicsMeta(): Promise<LocalClassicBook[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BOOKS_STORE, 'readonly');
    const store = transaction.objectStore(BOOKS_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export const useClassicBookStore = create<ClassicBookState>((set, get) => ({
  cachedClassics: new Map(),
  loadingBooks: new Set(),
  currentClassic: null,
  currentClassicBlob: null,

  loadCachedClassics: async () => {
    try {
      const cached = await getAllClassicsMeta();
      const cachedMap = new Map<string, LocalClassicBook>();
      cached.forEach((book) => cachedMap.set(book.id, book));
      set({ cachedClassics: cachedMap });
    } catch (error) {
      console.error('Failed to load cached classics:', error);
    }
  },

  fetchAndCacheClassic: async (book: ClassicBook) => {
    const { loadingBooks, cachedClassics } = get();

    // Check if already loading
    if (loadingBooks.has(book.id)) {
      return null;
    }

    // Check if already cached
    if (cachedClassics.has(book.id)) {
      const blob = await getClassicFile(book.id);
      if (blob) {
        set({ currentClassic: book, currentClassicBlob: blob });
        return blob;
      }
    }

    // Start loading
    set({ loadingBooks: new Set([...loadingBooks, book.id]) });

    try {
      // Fetch the EPUB file
      const response = await fetch(book.download_url);
      if (!response.ok) {
        throw new Error('Failed to fetch classic book');
      }

      const blob = await response.blob();
      const fileSize = blob.size;

      // Save to IndexedDB
      const localBook: LocalClassicBook = {
        ...book,
        cachedAt: Date.now(),
        fileSize,
      };

      await saveClassicMeta(localBook);
      await saveClassicFile(book.id, blob);

      // Update state
      const newCached = new Map(get().cachedClassics);
      newCached.set(book.id, localBook);

      const newLoading = new Set(get().loadingBooks);
      newLoading.delete(book.id);

      set({
        cachedClassics: newCached,
        loadingBooks: newLoading,
        currentClassic: book,
        currentClassicBlob: blob,
      });

      return blob;
    } catch (error) {
      console.error('Failed to cache classic book:', error);

      const newLoading = new Set(get().loadingBooks);
      newLoading.delete(book.id);
      set({ loadingBooks: newLoading });

      return null;
    }
  },

  getCachedClassicBlob: async (bookId: string) => {
    try {
      return await getClassicFile(bookId);
    } catch {
      return null;
    }
  },

  isClassicCached: (bookId: string) => {
    return get().cachedClassics.has(bookId);
  },

  isClassicLoading: (bookId: string) => {
    return get().loadingBooks.has(bookId);
  },

  setCurrentClassic: (book: ClassicBook | null) => {
    set({ currentClassic: book });
  },

  clearCurrentClassic: () => {
    set({ currentClassic: null, currentClassicBlob: null });
  },

  getClassicById: (id: string) => {
    return classicBooks.find((book) => book.id === id);
  },
}));
