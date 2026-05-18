export const MAX_POST_SLUG = 200;
export const MAX_AUTHOR_NAME = 80;
export const MAX_BODY = 2000;

export type CommentInput = {
  postSlug: string;
  authorName: string;
  body: string;
  website?: string;
};

export type CommentValidationResult =
  | { ok: true; data: CommentInput }
  | { ok: false; error: string };

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function validateCommentInput(body: unknown): CommentValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return { ok: false, error: "Invalid submission." };
  }

  const postSlug = typeof raw.postSlug === "string" ? stripHtml(raw.postSlug) : "";
  const authorName = typeof raw.authorName === "string" ? stripHtml(raw.authorName) : "";
  const commentBody = typeof raw.body === "string" ? stripHtml(raw.body) : "";

  if (!postSlug) {
    return { ok: false, error: "postSlug is required." };
  }
  if (postSlug.length > MAX_POST_SLUG) {
    return { ok: false, error: `postSlug must be at most ${MAX_POST_SLUG} characters.` };
  }
  if (!authorName) {
    return { ok: false, error: "Name is required." };
  }
  if (authorName.length > MAX_AUTHOR_NAME) {
    return { ok: false, error: `Name must be at most ${MAX_AUTHOR_NAME} characters.` };
  }
  if (!commentBody) {
    return { ok: false, error: "Comment is required." };
  }
  if (commentBody.length > MAX_BODY) {
    return { ok: false, error: `Comment must be at most ${MAX_BODY} characters.` };
  }

  return {
    ok: true,
    data: { postSlug, authorName, body: commentBody },
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
    data: { postSlug, authorName: "", body: "" },
  };
}
