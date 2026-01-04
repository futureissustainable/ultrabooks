import type { Metadata } from 'next';
import { classicBooks } from '@/lib/classics-data';
import { SITE_URL, getBookSchema } from '@/lib/seo';
import { ClassicReaderClient } from './ClassicReaderClient';

interface ClassicReaderPageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for all classic books (SSG)
export async function generateStaticParams() {
  return classicBooks.map((book) => ({
    id: book.id,
  }));
}

// Generate dynamic metadata for each classic book
export async function generateMetadata({ params }: ClassicReaderPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = classicBooks.find((b) => b.id === id);

  if (!book) {
    return {
      title: 'Book Not Found',
      description: 'The requested classic book was not found.',
    };
  }

  const title = `Read ${book.title} by ${book.author} - Free Ebook`;
  const description = `Read "${book.title}" by ${book.author} for free on MEMOROS. ${book.description} Enjoy this classic in our beautiful ebook reader with bookmarks, highlights, and cross-device sync.`;
  const url = `${SITE_URL}/reader/classic/${book.id}`;
  const imageUrl = book.cover_url.startsWith('http') ? book.cover_url : `${SITE_URL}${book.cover_url}`;

  return {
    title,
    description,
    keywords: [
      `read ${book.title} online`,
      `${book.title} free ebook`,
      `${book.author} books`,
      `${book.title} epub`,
      'free classic books',
      'read classic literature',
      'public domain books',
      'free ebook reader',
    ],
    openGraph: {
      type: 'book',
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 600,
          alt: `${book.title} by ${book.author} - Book Cover`,
        },
      ],
      authors: [book.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    other: {
      'book:author': book.author,
      'book:isbn': '',
      'og:book:author': book.author,
    },
  };
}

// Generate JSON-LD for the book
function BookStructuredData({ book }: { book: typeof classicBooks[0] }) {
  const schema = getBookSchema({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    coverUrl: book.cover_url,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export default async function ClassicReaderPage({ params }: ClassicReaderPageProps) {
  const { id } = await params;
  const book = classicBooks.find((b) => b.id === id);

  return (
    <>
      {book && <BookStructuredData book={book} />}
      <ClassicReaderClient id={id} />
    </>
  );
}
