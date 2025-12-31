import { useState, useEffect, useCallback } from 'react';
import { getFileUrl, isLegacyUrl } from '@/lib/supabase/storage';

interface UseSignedUrlOptions {
  /** Expiry time in seconds (default: 900 = 15 minutes) */
  expiresIn?: number;
  /** Auto-refresh before expiry (default: true) */
  autoRefresh?: boolean;
}

interface UseSignedUrlResult {
  /** The usable URL (signed or legacy public) */
  url: string | null;
  /** Whether the URL is currently loading */
  isLoading: boolean;
  /** Error message if URL generation failed */
  error: string | null;
  /** Manually refresh the signed URL */
  refresh: () => Promise<void>;
}

/**
 * Hook to get a signed URL for a book file.
 * Handles both legacy public URLs and new path-based storage.
 * Auto-refreshes before expiry to ensure uninterrupted reading.
 */
export function useSignedUrl(
  filePathOrUrl: string | null | undefined,
  options: UseSignedUrlOptions = {}
): UseSignedUrlResult {
  const { expiresIn = 900, autoRefresh = true } = options;

  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateUrl = useCallback(async () => {
    if (!filePathOrUrl) {
      setUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If it's a legacy full URL, it might still work (public bucket)
      // But we still try to get a signed URL for consistency
      const signedUrl = await getFileUrl(filePathOrUrl, expiresIn);

      if (signedUrl) {
        setUrl(signedUrl);
      } else if (isLegacyUrl(filePathOrUrl)) {
        // Fallback to legacy URL if signed URL generation fails
        setUrl(filePathOrUrl);
      } else {
        throw new Error('Failed to generate file URL');
      }
    } catch (err) {
      console.error('Error generating signed URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate URL');

      // Try legacy URL as last resort
      if (filePathOrUrl && isLegacyUrl(filePathOrUrl)) {
        setUrl(filePathOrUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filePathOrUrl, expiresIn]);

  // Initial URL generation
  useEffect(() => {
    generateUrl();
  }, [generateUrl]);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!autoRefresh || !url || isLoading) return;

    // Refresh 2 minutes before expiry
    const refreshTime = (expiresIn - 120) * 1000;
    if (refreshTime <= 0) return;

    const timer = setTimeout(() => {
      generateUrl();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [url, autoRefresh, expiresIn, isLoading, generateUrl]);

  return {
    url,
    isLoading,
    error,
    refresh: generateUrl,
  };
}
