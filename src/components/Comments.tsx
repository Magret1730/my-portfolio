"use client";

import { Button, Column, Heading, Input, Line, Row, Spinner, Text } from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

import { MAX_AUTHOR_NAME, MAX_BODY } from "@/lib/comments";

type Comment = {
  id: string;
  postSlug: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type CommentsProps = {
  postSlug: string;
};

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
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) {
      return;
    }

    const trimmedName = authorName.trim();
    const trimmedBody = body.trim();
    if (!trimmedName || !trimmedBody) {
      setError("Name and comment are required.");
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
          authorName: trimmedName,
          body: trimmedBody,
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
      setAuthorName("");
      setBody("");
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
              {index > 0 && <Line />}
              <Row gap="8" vertical="center">
                <Text variant="label-strong-s">{comment.authorName}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {formatCommentDate(comment.createdAt)}
                </Text>
              </Row>
              <Text variant="body-default-m">{comment.body}</Text>
            </Column>
          ))}
        </Column>
      )}

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Column fillWidth gap="16" padding="l" radius="l" background="surface" border="neutral-alpha-weak">
          <Heading as="h3" variant="heading-strong-s">
            Leave a comment
          </Heading>
          <Input
            id="comment-author"
            name="authorName"
            label="Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={MAX_AUTHOR_NAME}
            required
          />
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
          <Button type="submit" size="m" disabled={submitting}>
            {submitting ? "Posting…" : "Post comment"}
          </Button>
        </Column>
      </form>
    </Column>
  );
}
