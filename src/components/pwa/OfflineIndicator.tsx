'use client';

import { useEffect, useState } from 'react';
import { useOfflineStore } from '@/lib/stores/offline-store';
import { PixelIcon } from '@/components/icons/PixelIcon';
import { clsx } from 'clsx';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStore();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showBanner) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 border transition-all duration-200',
        isOnline
          ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
          : 'bg-[var(--bg-tertiary)] border-[var(--text-primary)]'
      )}
    >
      <PixelIcon
        name={isOnline ? 'wifi' : 'wifi-off'}
        size={16}
        className={isOnline ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}
      />
      <span className="font-ui fs-p-sm uppercase tracking-[0.02em]">
        {isOnline ? 'Back online' : 'You are offline'}
      </span>
      {!isOnline && (
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-[var(--bg-secondary)]"
        >
          <PixelIcon name="close" size={12} />
        </button>
      )}
    </div>
  );
}
