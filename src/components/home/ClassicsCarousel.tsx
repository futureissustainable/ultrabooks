'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { classicBooks } from '@/lib/classics-data';

export function ClassicsCarousel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Duplicate the books array for seamless infinite scroll
  const duplicatedBooks = [...classicBooks, ...classicBooks];

  return (
    <div className="classics-carousel-container" aria-label="Classic books carousel">
      <div className="classics-carousel-track">
        {duplicatedBooks.map((book, index) => (
          <div
            key={`${book.id}-${index}`}
            className="classics-carousel-item group"
          >
            <div className="aspect-[2/3] relative overflow-hidden border border-[var(--border-primary)] book-shadow transition-all duration-300 group-hover:scale-105">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 120px, (max-width: 1024px) 150px, 180px"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <span className="font-mono fs-p-sm text-[var(--text-tertiary)]">
                    {book.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="font-ui fs-p-sm text-[var(--text-secondary)] truncate text-center">
                {book.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fade overlays on edges */}
      <div className="classics-carousel-fade-left" />
      <div className="classics-carousel-fade-right" />
    </div>
  );
}
