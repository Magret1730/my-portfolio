"use client";

import { upload } from "@vercel/blob/client";
import { Button, Column, Heading, Row, Spinner, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthUser } from "@/lib/auth/useAuthUser";
import { MAX_BODY } from "@/lib/comments";

type Comment = {
  id: string;
  postSlug: string;
  authorName: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
};

type CommentsProps = {
  postSlug: string;
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatCommentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function Comments({ postSlug }: CommentsProps) {
  const pathname = usePathname() ?? "/";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const { user: sessionUser, loading: sessionLoading } = useAuthUser();
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInHref = `/auth/sign-in?redirect=${encodeURIComponent(pathname)}`;

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`);
      const data = (await res.json()) as { comments?: Comment[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to load comments.");
      }
      setCommentsList(data.comments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const clearImage = () => {
    setImageUrl(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 4 MB or smaller.");
      return;
    }

    setError(null);
    setUploadingImage(true);
    clearImage();

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      setImageUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
      URL.revokeObjectURL(preview);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || uploadingImage || !sessionUser) {
      return;
    }

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setError("Comment is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          body: trimmedBody,
          imageUrl: imageUrl ?? undefined,
          website,
        }),
      });
      const data = (await res.json()) as { comment?: Comment; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment.");
      }
      if (data.comment) {
        setCommentsList((prev) => [data.comment!, ...prev]);
      }
      setBody("");
      clearImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Column
      as="section"
      id="comments"
      fillWidth
      maxWidth="s"
      gap="24"
      marginTop="40"
      paddingTop="24"
      borderTop="neutral-alpha-weak"
    >
      <Heading as="h2" variant="heading-strong-l">
        Comments
      </Heading>

      {error && (
        <Text variant="body-default-s" onBackground="danger-weak">
          {error}
        </Text>
      )}

      {loading ? (
        <Row horizontal="center" padding="24">
          <Spinner size="m" />
        </Row>
      ) : commentsList.length === 0 ? (
        <Text variant="body-default-m" onBackground="neutral-weak">
          No comments yet — be the first.
        </Text>
      ) : (
        <Column fillWidth gap="16">
          {commentsList.map((comment, index) => (
            <Column key={comment.id} fillWidth gap="8">
              {index > 0 && <hr style={{ border: "none", borderTop: "1px solid var(--neutral-border-weak)" }} />}
              <Row gap="8" vertical="center">
                <Text variant="label-strong-s">{comment.authorName}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {formatCommentDate(comment.createdAt)}
                </Text>
              </Row>
              <Text variant="body-default-m">{comment.body}</Text>
              {comment.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.imageUrl}
                  alt="Comment attachment"
                  loading="lazy"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 320,
                    borderRadius: "var(--radius-s)",
                    objectFit: "contain",
                  }}
                />
              )}
            </Column>
          ))}
        </Column>
      )}

      {sessionLoading ? (
        <Row horizontal="center" padding="16">
          <Spinner size="s" />
        </Row>
      ) : !sessionUser ? (
        <Column
          fillWidth
          gap="12"
          padding="l"
          radius="l"
          background="surface"
          border="neutral-alpha-weak"
        >
          <Text variant="body-default-m" onBackground="neutral-weak">
            Sign in to leave a comment.
          </Text>
          <Button href={signInHref} size="m">
            Sign in
          </Button>
        </Column>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Column fillWidth gap="16" padding="l" radius="l" background="surface" border="neutral-alpha-weak">
            <Heading as="h3" variant="heading-strong-s">
              Leave a comment
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Posting as {sessionUser.name}
            </Text>
            <Column gap="8" fillWidth>
              <Text as="label" htmlFor="comment-body" variant="label-default-s">
                Comment
              </Text>
              <textarea
                id="comment-body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={MAX_BODY}
                required
                rows={4}
                style={{
                  width: "100%",
                  resize: "vertical",
                  padding: "12px",
                  borderRadius: "var(--radius-s)",
                  border: "1px solid var(--neutral-border-medium)",
                  background: "var(--page-background)",
                  color: "var(--neutral-on-background-strong)",
                  font: "inherit",
                }}
              />
            </Column>
            <Column gap="8" fillWidth>
              <Text variant="label-default-s">Image (optional)</Text>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleImageSelect}
                disabled={uploadingImage || submitting}
              />
              {uploadingImage && (
                <Row gap="8" vertical="center">
                  <Spinner size="s" />
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Uploading…
                  </Text>
                </Row>
              )}
              {imagePreview && !uploadingImage && (
                <Column gap="8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: "var(--radius-s)",
                      objectFit: "contain",
                    }}
                  />
                  <Button type="button" size="s" variant="tertiary" onClick={clearImage}>
                    Remove image
                  </Button>
                </Column>
              )}
            </Column>
            <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <Button type="submit" size="m" disabled={submitting || uploadingImage}>
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </Column>
        </form>
      )}
    </Column>
  );
}
