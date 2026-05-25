export const MAX_POST_SLUG = 200;
export const MAX_AUTHOR_NAME = 80;
export const MAX_BODY = 2000;
export const MAX_IMAGE_URL = 2048;

export type CommentInput = {
  postSlug: string;
  body: string;
  imageUrl?: string;
  website?: string;
};

export type CommentValidationResult =
  | { ok: true; data: CommentInput }
  | { ok: false; error: string };

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

import { isAllowedBlobUrl } from "@/lib/blob-url";

export { isAllowedBlobUrl } from "@/lib/blob-url";

export function validateCommentInput(body: unknown): CommentValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return { ok: false, error: "Invalid submission." };
  }

  const postSlug = typeof raw.postSlug === "string" ? stripHtml(raw.postSlug) : "";
  const commentBody = typeof raw.body === "string" ? stripHtml(raw.body) : "";
  const imageUrlRaw = typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "";
  const imageUrl = imageUrlRaw.length > 0 ? imageUrlRaw : undefined;

  if (!postSlug) {
    return { ok: false, error: "postSlug is required." };
  }
  if (postSlug.length > MAX_POST_SLUG) {
    return { ok: false, error: `postSlug must be at most ${MAX_POST_SLUG} characters.` };
  }
  if (!commentBody) {
    return { ok: false, error: "Comment is required." };
  }
  if (commentBody.length > MAX_BODY) {
    return { ok: false, error: `Comment must be at most ${MAX_BODY} characters.` };
  }
  if (imageUrl) {
    if (imageUrl.length > MAX_IMAGE_URL) {
      return { ok: false, error: "Image URL is too long." };
    }
    if (!isAllowedBlobUrl(imageUrl)) {
      return { ok: false, error: "Invalid image URL." };
    }
  }

  return {
    ok: true,
    data: { postSlug, body: commentBody, imageUrl },
  };
}

export function validatePostSlugQuery(value: string | null): CommentValidationResult {
  const postSlug = value?.trim() ?? "";
  if (!postSlug) {
    return { ok: false, error: "postSlug query parameter is required." };
  }
  if (postSlug.length > MAX_POST_SLUG) {
    return { ok: false, error: `postSlug must be at most ${MAX_POST_SLUG} characters.` };
  }
  return {
    ok: true,
    data: { postSlug, body: "" },
  };
}
