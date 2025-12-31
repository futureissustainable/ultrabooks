'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Hero cover images from /public/hero-covers/
// We have 14 covers: 01-13 are .avif, 14 is .jpg
const HERO_COVERS = [
  '/hero-covers/01.avif',
  '/hero-covers/02.avif',
  '/hero-covers/03.avif',
  '/hero-covers/04.avif',
  '/hero-covers/05.avif',
  '/hero-covers/06.avif',
  '/hero-covers/07.avif',
  '/hero-covers/08.avif',
  '/hero-covers/09.avif',
  '/hero-covers/10.avif',
  '/hero-covers/11.avif',
  '/hero-covers/12.avif',
  '/hero-covers/13.avif',
  '/hero-covers/14.jpg',
];

interface BookCoverProps {
  index: number;
  useRealCovers: boolean;
}

function BookCover({ index, useRealCovers }: BookCoverProps) {
  const [hasError, setHasError] = useState(false);
  const coverPath = HERO_COVERS[index % HERO_COVERS.length];

  if (!useRealCovers || hasError) {
    // Render a stylized placeholder
    const patterns = ['stripes', 'dots', 'grid', 'solid', 'gradient'];
    const pattern = patterns[index % patterns.length];
    const baseOpacity = 0.6 + (index % 3) * 0.1;

    return (
      <div
        className="hero-book-cover"
        style={{
          background: pattern === 'stripes'
            ? `repeating-linear-gradient(45deg, var(--gray-800), var(--gray-800) 4px, var(--gray-900) 4px, var(--gray-900) 8px)`
            : pattern === 'dots'
            ? `radial-gradient(circle, var(--gray-700) 1px, var(--gray-900) 1px)`
            : pattern === 'grid'
            ? `linear-gradient(var(--gray-700) 1px, transparent 1px), linear-gradient(90deg, var(--gray-700) 1px, transparent 1px)`
            : pattern === 'gradient'
            ? `linear-gradient(135deg, var(--gray-800) 0%, var(--gray-950) 100%)`
            : 'var(--gray-900)',
          backgroundSize: pattern === 'dots' ? '8px 8px' : pattern === 'grid' ? '16px 16px' : 'auto',
          opacity: baseOpacity,
        }}
      />
    );
  }

  return (
    <div className="hero-book-cover relative overflow-hidden">
      <Image
        src={coverPath}
        alt={`Book cover ${index + 1}`}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 80px, (max-width: 1024px) 100px, 120px"
      />
    </div>
  );
}

export function HeroBooks() {
  const [useRealCovers, setUseRealCovers] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if real covers exist
    const img = new window.Image();
    img.onload = () => setUseRealCovers(true);
    img.onerror = () => setUseRealCovers(false);
    img.src = '/hero-covers/01.avif';
  }, []);

  if (!mounted) {
    return null;
  }

  // Create rows with different starting offsets for variety
  const rows = [
    { id: 1, offset: 0, direction: 'left' },
    { id: 2, offset: 5, direction: 'right' },
    { id: 3, offset: 10, direction: 'left' },
    { id: 4, offset: 15, direction: 'right' },
    { id: 5, offset: 20, direction: 'left' },
    { id: 6, offset: 25, direction: 'right' },
  ];

  // Books per row (duplicated for seamless loop)
  const booksPerRow = 20;

  return (
    <div className="hero-books-container" aria-hidden="true">
      {/* Tilted grid wrapper */}
      <div className="hero-books-grid">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`hero-books-row hero-books-row-${row.direction}`}
          >
            {/* First set */}
            {Array.from({ length: booksPerRow }, (_, i) => (
              <BookCover
                key={`r${row.id}-${i}`}
                index={i + row.offset}
                useRealCovers={useRealCovers}
              />
            ))}
            {/* Duplicate for seamless loop */}
            {Array.from({ length: booksPerRow }, (_, i) => (
              <BookCover
                key={`r${row.id}-dup-${i}`}
                index={i + row.offset}
                useRealCovers={useRealCovers}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Strong gradient overlay for readability */}
      <div className="hero-gradient-overlay" />
    </div>
  );
}
