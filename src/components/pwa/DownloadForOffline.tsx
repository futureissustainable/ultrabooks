'use client';

import { useOfflineStore } from '@/lib/stores/offline-store';
import { getFileUrl } from '@/lib/supabase/storage';
import { Button, Spinner } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface DownloadForOfflineProps {
  bookId: string;
  fileUrl: string;  // Can be legacy full URL or new path
  variant?: 'button' | 'icon';
  className?: string;
}

export function DownloadForOffline({
  bookId,
  fileUrl,
  variant = 'button',
  className,
}: DownloadForOfflineProps) {
  const { cacheBook, removeCachedBook, isBookCached, isBookCaching, isServiceWorkerReady } = useOfflineStore();

  const isCached = isBookCached(bookId);
  const isCaching = isBookCaching(bookId);

  if (!isServiceWorkerReady) {
    return null;
  }

  const handleClick = async () => {
    if (isCached) {
      removeCachedBook(bookId);
    } else if (!isCaching) {
      // Generate a signed URL for downloading (longer expiry for caching)
      const signedUrl = await getFileUrl(fileUrl, 3600); // 1 hour expiry
      if (signedUrl) {
        await cacheBook(bookId, signedUrl);
      }
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isCaching}
        className={`p-2 transition-colors border border-[var(--border-primary)] ${
          isCached
            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
        } ${className || ''}`}
        aria-label={isCached ? 'Remove from offline' : 'Download for offline'}
        title={isCached ? 'Available offline - click to remove' : 'Download for offline reading'}
      >
        {isCaching ? (
          <Spinner size="sm" />
        ) : (
          <PixelIcon name={isCached ? 'check' : 'download'} size={14} />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isCached ? 'primary' : 'secondary'}
      onClick={handleClick}
      disabled={isCaching}
      className={className}
    >
      {isCaching ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Downloading...
        </>
      ) : isCached ? (
        <>
          <PixelIcon name="check" size={12} className="mr-2" />
          Available Offline
        </>
      ) : (
        <>
          <PixelIcon name="download" size={12} className="mr-2" />
          Download for Offline
        </>
      )}
    </Button>
  );
}
