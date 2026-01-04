import type { Metadata } from 'next';

// Base URL for the application
export const SITE_URL = 'https://memoros.app';
export const SITE_NAME = 'MEMOROS';

// Primary and secondary keywords for SEO targeting
export const SEO_KEYWORDS = {
  primary: [
    'book app',
    'ebook reader',
    'epub reader',
    'epub reading app',
    'pdf reader app',
    'mobi reader',
    'ebook app',
    'digital book reader',
    'online book reader',
    'best book app',
  ],
  secondary: [
    'read books online',
    'free ebook reader',
    'book reading app',
    'epub viewer',
    'pdf book reader',
    'cross-device reading',
    'sync reading progress',
    'book annotations',
    'reading highlights',
    'book bookmarks',
    'classic literature',
    'free classic books',
    'digital library',
    'personal library app',
    'reading tracker',
  ],
  longTail: [
    'best free ebook reader app',
    'epub reader with sync',
    'read epub files online',
    'book app with cloud sync',
    'ebook reader with highlights',
    'pdf and epub reader',
    'cross platform book reader',
    'ebook reader with annotations',
    'free book reading app',
    'best epub reader 2025',
  ],
};

// All keywords flattened for meta tags
export const ALL_KEYWORDS = [
  ...SEO_KEYWORDS.primary,
  ...SEO_KEYWORDS.secondary,
  ...SEO_KEYWORDS.longTail,
];

// Default metadata for the site
export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MEMOROS - Best Free Ebook Reader App for EPUB, PDF & MOBI | Read Books Online',
    template: '%s | MEMOROS - Ebook Reader App',
  },
  description:
    'MEMOROS is the best free ebook reader app for EPUB, PDF, and MOBI files. Sync your reading progress, bookmarks, and highlights across all devices. Read classic books for free. The ultimate book app for digital readers.',
  keywords: ALL_KEYWORDS,
  authors: [{ name: 'MEMOROS Team' }],
  creator: 'MEMOROS',
  publisher: 'MEMOROS',
  applicationName: 'MEMOROS',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'MEMOROS - Best Free Ebook Reader App for EPUB, PDF & MOBI',
    description:
      'The best free ebook reader app. Read EPUB, PDF, and MOBI files. Sync progress across devices. Free classic books included.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MEMOROS - Best Ebook Reader App',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEMOROS - Best Free Ebook Reader App',
    description:
      'Read EPUB, PDF & MOBI files. Sync across devices. Free classic books. The ultimate book app.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@memoros_app',
    site: '@memoros_app',
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'Books & Education',
  classification: 'Ebook Reader Application',
  other: {
    'apple-itunes-app': 'app-id=memoros',
    'google-play-app': 'app-id=app.memoros',
    'mobile-web-app-capable': 'yes',
    'application-name': 'MEMOROS',
    'msapplication-TileColor': '#0a0a0a',
    'msapplication-config': '/browserconfig.xml',
  },
};

// Schema.org structured data for the organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MEMOROS',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description: 'MEMOROS is a free ebook reader app for EPUB, PDF, and MOBI files with cross-device sync.',
    sameAs: [
      'https://twitter.com/memoros_app',
      'https://github.com/memoros',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/support`,
    },
  };
}

// Schema.org structured data for the website
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MEMOROS',
    alternateName: ['MEMOROS Ebook Reader', 'MEMOROS Book App'],
    url: SITE_URL,
    description: 'The best free ebook reader app for EPUB, PDF, and MOBI files.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/library?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MEMOROS',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
      },
    },
  };
}

// Schema.org structured data for the software application
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MEMOROS',
    alternateName: 'MEMOROS Ebook Reader',
    description:
      'MEMOROS is the best free ebook reader app for EPUB, PDF, and MOBI files. Features include cross-device sync, bookmarks, highlights, annotations, and a library of free classic books.',
    url: SITE_URL,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Book Reader',
    operatingSystem: 'Web, iOS, Android, Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2847',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'EPUB file support',
      'PDF file support',
      'MOBI file support',
      'Cross-device reading sync',
      'Bookmarks and highlights',
      'Reading annotations',
      'Customizable reading experience',
      'Dark mode and sepia mode',
      'Offline reading support',
      'Free classic books library',
      'Reading progress tracking',
      'Book sharing',
      'Collection organization',
    ],
    screenshot: [
      {
        '@type': 'ImageObject',
        url: `${SITE_URL}/screenshots/library.png`,
        caption: 'MEMOROS Library View',
      },
      {
        '@type': 'ImageObject',
        url: `${SITE_URL}/screenshots/reader.png`,
        caption: 'MEMOROS Reader View',
      },
    ],
    softwareVersion: '2.0',
    author: {
      '@type': 'Organization',
      name: 'MEMOROS',
    },
    downloadUrl: SITE_URL,
    installUrl: SITE_URL,
    permissions: 'none',
    releaseNotes: 'Latest version with improved sync and new features.',
  };
}

// Schema.org structured data for the webpage
export function getWebPageSchema(options: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.title,
    description: options.description,
    url: options.url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'MEMOROS',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MEMOROS',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
      },
    },
    ...(options.datePublished && { datePublished: options.datePublished }),
    ...(options.dateModified && { dateModified: options.dateModified }),
  };
}

// Schema.org FAQ schema for GEO optimization
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best free ebook reader app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MEMOROS is the best free ebook reader app that supports EPUB, PDF, and MOBI formats. It offers cross-device sync, bookmarks, highlights, and a library of free classic books. Available on web, iOS, Android, and all desktop platforms.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I read EPUB files on my computer or phone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can read EPUB files using MEMOROS, a free ebook reader app. Simply visit memoros.app, create a free account, and upload your EPUB files. Your books sync across all devices automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'What formats does MEMOROS ebook reader support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MEMOROS supports all major ebook formats including EPUB, PDF, and MOBI. It provides a seamless reading experience with features like adjustable fonts, dark mode, bookmarks, and highlights.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I sync my reading progress across devices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! MEMOROS automatically syncs your reading progress, bookmarks, highlights, and annotations across all your devices. Start reading on your phone and continue exactly where you left off on your tablet or computer.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is MEMOROS really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, MEMOROS is completely free to use. There are no ads, no subscription fees, and no hidden costs. We believe reading should be accessible to everyone.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does MEMOROS have free books to read?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! MEMOROS includes a curated library of over 30 classic books that are free to read, including works by Dostoevsky, Tolstoy, Kafka, Austen, and more. All beautifully formatted for the best reading experience.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use MEMOROS offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, MEMOROS is a Progressive Web App (PWA) that works offline. Once you have downloaded a book, you can read it without an internet connection. Your progress will sync when you are back online.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I share a book with friends?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MEMOROS allows you to share books with friends through secure, expiring share links. You can choose to include your bookmarks, highlights, and notes when sharing.',
        },
      },
    ],
  };
}

// Schema.org BreadcrumbList schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Schema.org Book schema for classic books
export function getBookSchema(book: {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    description: book.description,
    image: book.coverUrl.startsWith('http') ? book.coverUrl : `${SITE_URL}${book.coverUrl}`,
    url: `${SITE_URL}/reader/classic/${book.id}`,
    inLanguage: 'en',
    bookFormat: 'https://schema.org/EBook',
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: 'MEMOROS',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

// Helper to create page metadata
export function createPageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL;

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords || ALL_KEYWORDS,
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      images: options.ogImage ? [options.ogImage] : undefined,
    },
    twitter: {
      title: options.title,
      description: options.description,
      images: options.ogImage ? [options.ogImage] : undefined,
    },
  };
}
