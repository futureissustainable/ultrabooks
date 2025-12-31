import { createClient } from './client';

/**
 * Generate a signed URL for a private file
 * @param filePath - The path to the file in the bucket (e.g., "user123/abc.epub")
 * @param bucket - The storage bucket name (default: 'books')
 * @param expiresIn - URL expiry time in seconds (default: 900 = 15 minutes)
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = 'books',
  expiresIn: number = 900
): Promise<string | null> {
  if (!filePath) return null;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Failed to create signed URL:', error.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate signed URLs for multiple files at once
 * @param filePaths - Array of file paths
 * @param bucket - The storage bucket name (default: 'books')
 * @param expiresIn - URL expiry time in seconds (default: 900 = 15 minutes)
 */
export async function getSignedUrls(
  filePaths: string[],
  bucket: string = 'books',
  expiresIn: number = 900
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!filePaths.length) return result;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(filePaths, expiresIn);

  if (error) {
    console.error('Failed to create signed URLs:', error.message);
    return result;
  }

  data.forEach((item) => {
    if (item.signedUrl && item.path) {
      result.set(item.path, item.signedUrl);
    }
  });

  return result;
}

/**
 * Get a public URL for a file in a public bucket (covers)
 * @param filePath - The path to the file
 * @param bucket - The storage bucket name (default: 'covers')
 */
export function getPublicUrl(
  filePath: string,
  bucket: string = 'covers'
): string | null {
  if (!filePath) return null;

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Check if a URL is a legacy full public URL (needs migration)
 * Legacy: https://xxx.supabase.co/storage/v1/object/public/books/user123/file.epub
 * New: user123/abc123.epub (just the path)
 */
export function isLegacyUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Extract the file path from a legacy public URL
 * Input: https://xxx.supabase.co/storage/v1/object/public/books/user123/file.epub
 * Output: user123/file.epub
 */
export function extractPathFromLegacyUrl(url: string): string | null {
  if (!isLegacyUrl(url)) return url; // Already a path

  try {
    const urlObj = new URL(url);
    // Match both /public/books/ and /sign/books/ patterns
    const match = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/books\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get a usable URL for a file, handling both legacy URLs and new paths
 * - For legacy public URLs: tries signed URL first, falls back to original
 * - For new paths: generates a signed URL
 */
export async function getFileUrl(
  filePathOrUrl: string,
  expiresIn: number = 900
): Promise<string | null> {
  if (!filePathOrUrl) return null;

  // If it's a legacy full URL, try signed URL but fallback to original
  if (isLegacyUrl(filePathOrUrl)) {
    const path = extractPathFromLegacyUrl(filePathOrUrl);
    if (!path) return filePathOrUrl; // Fallback to original URL

    // Try signed URL first
    const signedUrl = await getSignedUrl(path, 'books', expiresIn);
    // If signing fails (e.g., public bucket), fallback to original legacy URL
    return signedUrl || filePathOrUrl;
  }

  // It's already a path, generate signed URL
  return getSignedUrl(filePathOrUrl, 'books', expiresIn);
}

/**
 * Get a usable URL for a cover image
 * Covers are stored in the public 'covers' bucket
 */
export function getCoverUrl(coverPathOrUrl: string | null | undefined): string | null {
  if (!coverPathOrUrl) return null;

  // If it's a legacy full URL pointing to books bucket, it still works for now
  if (isLegacyUrl(coverPathOrUrl)) {
    return coverPathOrUrl;
  }

  // New path format - get from public covers bucket
  return getPublicUrl(coverPathOrUrl, 'covers');
}

/**
 * Generate a UUID for file naming
 */
export function generateFileId(): string {
  return crypto.randomUUID();
}
