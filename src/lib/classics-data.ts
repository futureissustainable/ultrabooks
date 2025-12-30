import type { ClassicBook } from '@/components/library/BookRow';

// Public domain classics available from Standard Ebooks
// These are beautifully formatted, free EPUB files
export const classicBooks: ClassicBook[] = [
  {
    id: 'crime-punishment',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    download_url: 'https://standardebooks.org/ebooks/fyodor-dostoevsky/crime-and-punishment/constance-garnett/downloads/fyodor-dostoevsky_crime-and-punishment_constance-garnett.epub',
    description: 'A young student commits a murder and struggles with guilt.',
  },
  {
    id: 'brothers-karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    download_url: 'https://standardebooks.org/ebooks/fyodor-dostoevsky/the-brothers-karamazov/constance-garnett/downloads/fyodor-dostoevsky_the-brothers-karamazov_constance-garnett.epub',
    description: 'A philosophical novel about faith, free will, and morality.',
  },
  {
    id: 'notes-underground',
    title: 'Notes from Underground',
    author: 'Fyodor Dostoevsky',
    download_url: 'https://standardebooks.org/ebooks/fyodor-dostoevsky/notes-from-underground/constance-garnett/downloads/fyodor-dostoevsky_notes-from-underground_constance-garnett.epub',
    description: 'The confessions of a bitter, isolated narrator.',
  },
  {
    id: 'metamorphosis',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    download_url: 'https://standardebooks.org/ebooks/franz-kafka/the-metamorphosis/david-wyllie/downloads/franz-kafka_the-metamorphosis_david-wyllie.epub',
    description: 'A man wakes up transformed into a giant insect.',
  },
  {
    id: 'trial',
    title: 'The Trial',
    author: 'Franz Kafka',
    download_url: 'https://standardebooks.org/ebooks/franz-kafka/the-trial/david-wyllie/downloads/franz-kafka_the-trial_david-wyllie.epub',
    description: 'A man is arrested and prosecuted by a remote authority.',
  },
  {
    id: 'thus-spoke-zarathustra',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    download_url: 'https://standardebooks.org/ebooks/friedrich-nietzsche/thus-spoke-zarathustra/thomas-common/downloads/friedrich-nietzsche_thus-spoke-zarathustra_thomas-common.epub',
    description: 'A philosophical novel about the Übermensch.',
  },
  {
    id: 'beyond-good-evil',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    download_url: 'https://standardebooks.org/ebooks/friedrich-nietzsche/beyond-good-and-evil/helen-zimmern/downloads/friedrich-nietzsche_beyond-good-and-evil_helen-zimmern.epub',
    description: 'A critique of past philosophers and morality.',
  },
  {
    id: 'complete-poe',
    title: 'Short Fiction',
    author: 'Edgar Allan Poe',
    download_url: 'https://standardebooks.org/ebooks/edgar-allan-poe/short-fiction/downloads/edgar-allan-poe_short-fiction.epub',
    description: 'Tales of mystery, horror, and the macabre.',
  },
  {
    id: 'war-peace',
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    download_url: 'https://standardebooks.org/ebooks/leo-tolstoy/war-and-peace/louise-maude_aylmer-maude/downloads/leo-tolstoy_war-and-peace_louise-maude_aylmer-maude.epub',
    description: 'An epic novel of Russian society during the Napoleonic wars.',
  },
  {
    id: 'anna-karenina',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    download_url: 'https://standardebooks.org/ebooks/leo-tolstoy/anna-karenina/constance-garnett/downloads/leo-tolstoy_anna-karenina_constance-garnett.epub',
    description: 'A tragic tale of love and society in Imperial Russia.',
  },
  {
    id: 'fear-trembling',
    title: 'Fear and Trembling',
    author: 'Søren Kierkegaard',
    download_url: 'https://standardebooks.org/ebooks/soren-kierkegaard/fear-and-trembling/walter-lowrie/downloads/soren-kierkegaard_fear-and-trembling_walter-lowrie.epub',
    description: 'A meditation on faith through the story of Abraham.',
  },
  {
    id: 'sickness-unto-death',
    title: 'The Sickness Unto Death',
    author: 'Søren Kierkegaard',
    download_url: 'https://standardebooks.org/ebooks/soren-kierkegaard/the-sickness-unto-death/walter-lowrie/downloads/soren-kierkegaard_the-sickness-unto-death_walter-lowrie.epub',
    description: 'An exploration of despair and the self.',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    download_url: 'https://standardebooks.org/ebooks/mary-shelley/frankenstein/downloads/mary-shelley_frankenstein.epub',
    description: 'The story of a scientist who creates a monster.',
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    download_url: 'https://standardebooks.org/ebooks/bram-stoker/dracula/downloads/bram-stoker_dracula.epub',
    description: 'The classic vampire novel.',
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    download_url: 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/jane-austen_pride-and-prejudice.epub',
    description: 'A romantic novel of manners.',
  },
  {
    id: '1984',
    title: 'Nineteen Eighty-Four',
    author: 'George Orwell',
    download_url: 'https://standardebooks.org/ebooks/george-orwell/nineteen-eighty-four/downloads/george-orwell_nineteen-eighty-four.epub',
    description: 'A dystopian novel about totalitarianism.',
  },
  {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    download_url: 'https://standardebooks.org/ebooks/f-scott-fitzgerald/the-great-gatsby/downloads/f-scott-fitzgerald_the-great-gatsby.epub',
    description: 'A novel about the American Dream in the Jazz Age.',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    download_url: 'https://standardebooks.org/ebooks/herman-melville/moby-dick/downloads/herman-melville_moby-dick.epub',
    description: 'The epic tale of Captain Ahab and the white whale.',
  },
];

// Get a random selection of classics
export function getRandomClassics(count: number = 8): ClassicBook[] {
  const shuffled = [...classicBooks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
