/** Hostnames allowed for comment image URLs (Vercel Blob storage). */
export function isAllowedBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.includes("blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}
