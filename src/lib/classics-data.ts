import type { ClassicBook } from '@/components/library/BookRow';

// Public domain classics with local EPUB files and covers
export const classicBooks: ClassicBook[] = [
  {
    id: 'brothers-karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    cover_url: '/books/classics/The Brothers Karamazov.avif',
    download_url: '/books/classics/Brothers Karamazov.epub',
    description: 'A philosophical novel about faith, free will, and morality.',
  },
  {
    id: 'notes-underground',
    title: 'Notes from Underground',
    author: 'Fyodor Dostoevsky',
    cover_url: '/books/classics/Notes from the underground.avif',
    download_url: '/books/classics/Notes from the underground.epub',
    description: 'The confessions of a bitter, isolated narrator.',
  },
  {
    id: 'metamorphosis',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    cover_url: '/books/classics/Metamorphosis.avif',
    download_url: '/books/classics/Metamorphosis.epub',
    description: 'A man wakes up transformed into a giant insect.',
  },
  {
    id: 'trial',
    title: 'The Trial',
    author: 'Franz Kafka',
    cover_url: '/books/classics/The Trial.avif',
    download_url: '/books/classics/The Trial.epub',
    description: 'A man is arrested and prosecuted by a remote authority.',
  },
  {
    id: 'thus-spoke-zarathustra',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    cover_url: '/books/classics/Thus Spoke Zarathustra.avif',
    download_url: '/books/classics/Thus spoke Zarathustra.epub',
    description: 'A philosophical novel about the Übermensch.',
  },
  {
    id: 'beyond-good-evil',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    cover_url: '/books/classics/Beyond Good and Evil.avif',
    download_url: '/books/classics/Beyond good and evil.epub',
    description: 'A critique of past philosophers and morality.',
  },
  {
    id: 'complete-poe',
    title: 'Poetry & Tales',
    author: 'Edgar Allan Poe',
    cover_url: '/books/classics/Edgar Allan Poe Poems.avif',
    download_url: '/books/classics/Collection Edgar Allan Poe.epub',
    description: 'Tales of mystery, horror, and the macabre.',
  },
  {
    id: 'war-peace',
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    cover_url: '/books/classics/War and Peace.avif',
    download_url: '/books/classics/War and peace.epub',
    description: 'An epic novel of Russian society during the Napoleonic wars.',
  },
  {
    id: 'anna-karenina',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    cover_url: '/books/classics/Anna Karenina.avif',
    download_url: '/books/classics/Anna Karenina.epub',
    description: 'A tragic tale of love and society in Imperial Russia.',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    cover_url: '/books/classics/Frankenstein.avif',
    download_url: '/books/classics/Frankenstein.epub',
    description: 'The story of a scientist who creates a monster.',
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    cover_url: '/books/classics/Dracula.avif',
    download_url: '/books/classics/Dracula.epub',
    description: 'The classic vampire novel.',
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover_url: '/books/classics/Pride and Prejudice.avif',
    download_url: '/books/classics/Pride and Prejudice.epub',
    description: 'A romantic novel of manners.',
  },
  {
    id: '1984',
    title: 'Nineteen Eighty-Four',
    author: 'George Orwell',
    cover_url: '/books/classics/1984 Orwell.avif',
    download_url: '/books/classics/1984.epub',
    description: 'A dystopian novel about totalitarianism.',
  },
  {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover_url: '/books/classics/The Great Gatsby.avif',
    download_url: '/books/classics/The great gatsby.epub',
    description: 'A novel about the American Dream in the Jazz Age.',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    cover_url: '/books/classics/Moby Dick.avif',
    download_url: '/books/classics/Moby Dick.epub',
    description: 'The epic tale of Captain Ahab and the white whale.',
  },
  {
    id: 'anthem',
    title: 'Anthem',
    author: 'Ayn Rand',
    cover_url: '/books/classics/Anthem Ayn Rand.avif',
    download_url: '/books/classics/Anthem.epub',
    description: 'A dystopian novella about individualism.',
  },
];

// Get a random selection of classics
export function getRandomClassics(count: number = 8): ClassicBook[] {
  const shuffled = [...classicBooks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
