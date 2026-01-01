import { create } from 'zustand';

interface OfflineBook {
  bookId: string;
  fileUrl: string;
  cachedAt: number;
  size: number;
}

interface OfflineState {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  cachedBooks: Map<string, OfflineBook>;
  cachingBooks: Set<string>;

  setOnline: (online: boolean) => void;
  setServiceWorkerReady: (ready: boolean) => void;
  cacheBook: (bookId: string, fileUrl: string) => Promise<boolean>;
  removeCachedBook: (bookId: string) => void;
  isBookCached: (bookId: string) => boolean;
  isBookCaching: (bookId: string) => boolean;
  loadCachedBooks: () => void;
}

// IndexedDB wrapper for offline data
const DB_NAME = 'memoros-offline';
const DB_VERSION = 1;
const BOOKS_STORE = 'cached-books';
const PROGRESS_STORE = 'reading-progress';

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
        database.createObjectStore(BOOKS_STORE, { keyPath: 'bookId' });
      }

      // Store for offline reading progress
      if (!database.objectStoreNames.contains(PROGRESS_STORE)) {
        const progressStore = database.createObjectStore(PROGRESS_STORE, { keyPath: 'bookId' });
        progressStore.createIndex('lastUpdated', 'lastUpdated');
      }
    };
  });
}

async function saveCachedBookMeta(book: OfflineBook): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BOOKS_STORE, 'readwrite');
    const store = transaction.objectStore(BOOKS_STORE);
    const request = store.put(book);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getCachedBooksMeta(): Promise<OfflineBook[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BOOKS_STORE, 'readonly');
    const store = transaction.objectStore(BOOKS_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeCachedBookMeta(bookId: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BOOKS_STORE, 'readwrite');
    const store = transaction.objectStore(BOOKS_STORE);
    const request = store.delete(bookId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Reading progress sync functions
export interface OfflineProgress {
  bookId: string;
  location: string;
  page: number;
  percentage: number;
  lastUpdated: number;
  synced: boolean;
}

export async function saveOfflineProgress(progress: OfflineProgress): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROGRESS_STORE, 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.put(progress);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOfflineProgress(bookId: string): Promise<OfflineProgress | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROGRESS_STORE, 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.get(bookId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getUnsyncedProgress(): Promise<OfflineProgress[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROGRESS_STORE, 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result.filter((p: OfflineProgress) => !p.synced);
      resolve(results);
    };
  });
}

export async function markProgressSynced(bookId: string): Promise<void> {
  const progress = await getOfflineProgress(bookId);
  if (progress) {
    progress.synced = true;
    await saveOfflineProgress(progress);
  }
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isServiceWorkerReady: false,
  cachedBooks: new Map(),
  cachingBooks: new Set(),

  setOnline: (online) => set({ isOnline: online }),

  setServiceWorkerReady: (ready) => set({ isServiceWorkerReady: ready }),

  cacheBook: async (bookId, fileUrl) => {
    const { cachingBooks } = get();
    if (cachingBooks.has(bookId)) return false;

    set({ cachingBooks: new Set([...cachingBooks, bookId]) });

    try {
      // Send message to service worker to cache the book
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_BOOK',
          payload: { bookId, url: fileUrl },
        });

        // Wait for confirmation (with timeout)
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            const { cachingBooks } = get();
            const newCaching = new Set(cachingBooks);
            newCaching.delete(bookId);
            set({ cachingBooks: newCaching });
            resolve(false);
          }, 60000); // 60 second timeout

          const handler = async (event: MessageEvent) => {
            if (event.data.type === 'BOOK_CACHED' && event.data.payload.bookId === bookId) {
              clearTimeout(timeout);
              navigator.serviceWorker.removeEventListener('message', handler);

              const { cachingBooks, cachedBooks } = get();
              const newCaching = new Set(cachingBooks);
              newCaching.delete(bookId);

              if (event.data.payload.success) {
                // Get file size (estimate based on fetch)
                const response = await fetch(fileUrl, { method: 'HEAD' });
                const size = parseInt(response.headers.get('content-length') || '0', 10);

                const book: OfflineBook = {
                  bookId,
                  fileUrl,
                  cachedAt: Date.now(),
                  size,
                };

                await saveCachedBookMeta(book);
                const newCached = new Map(cachedBooks);
                newCached.set(bookId, book);
                set({ cachedBooks: newCached, cachingBooks: newCaching });
                resolve(true);
              } else {
                set({ cachingBooks: newCaching });
                resolve(false);
              }
            }
          };

          navigator.serviceWorker.addEventListener('message', handler);
        });
      }
      return false;
    } catch (error) {
      const { cachingBooks } = get();
      const newCaching = new Set(cachingBooks);
      newCaching.delete(bookId);
      set({ cachingBooks: newCaching });
      return false;
    }
  },

  removeCachedBook: async (bookId) => {
    const { cachedBooks } = get();
    const book = cachedBooks.get(bookId);

    if (book && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REMOVE_CACHED_BOOK',
        payload: { url: book.fileUrl },
      });
    }

    await removeCachedBookMeta(bookId);
    const newCached = new Map(cachedBooks);
    newCached.delete(bookId);
    set({ cachedBooks: newCached });
  },

  isBookCached: (bookId) => get().cachedBooks.has(bookId),

  isBookCaching: (bookId) => get().cachingBooks.has(bookId),

  loadCachedBooks: async () => {
    try {
      const books = await getCachedBooksMeta();
      const cachedMap = new Map<string, OfflineBook>();
      books.forEach((book) => cachedMap.set(book.bookId, book));
      set({ cachedBooks: cachedMap });
    } catch (error) {
      console.error('Failed to load cached books:', error);
    }
  },
}));

// Initialize offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
  });
}
