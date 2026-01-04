import { MetadataRoute } from 'next';
import { classicBooks } from '@/lib/classics-data';

const SITE_URL = 'https://memoros.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Main static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Classic books pages - important for SEO as they're public content
  const classicBookPages: MetadataRoute.Sitemap = classicBooks.map((book) => ({
    url: `${SITE_URL}/reader/classic/${book.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...classicBookPages];
}
