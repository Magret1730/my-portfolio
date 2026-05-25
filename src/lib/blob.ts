import { del } from "@vercel/blob";

import { isAllowedBlobUrl } from "@/lib/blob-url";

export { isAllowedBlobUrl } from "@/lib/blob-url";

export async function tryDeleteBlobUrl(url: string | null | undefined): Promise<void> {
  if (!url?.trim() || !isAllowedBlobUrl(url)) {
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return;
  }

  try {
    await del(url, { token });
  } catch {
    // Comment row is still removed if blob delete fails (orphan blob is acceptable).
  }
}
