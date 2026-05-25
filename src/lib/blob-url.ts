/** Hostnames allowed for comment image URLs (Vercel Blob public storage). */
const ALLOWED_BLOB_HOST_SUFFIXES = [
  ".public.blob.vercel-storage.com",
  ".blob.vercel-storage.com",
] as const;

const ALLOWED_BLOB_HOSTS = new Set([
  "public.blob.vercel-storage.com",
  "blob.vercel-storage.com",
]);

export function isAllowedBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    if (ALLOWED_BLOB_HOSTS.has(parsed.hostname)) {
      return true;
    }
    return ALLOWED_BLOB_HOST_SUFFIXES.some((suffix) =>
      parsed.hostname.endsWith(suffix),
    );
  } catch {
    return false;
  }
}
