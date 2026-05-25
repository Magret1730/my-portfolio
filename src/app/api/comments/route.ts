import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { comments } from "@/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { validateCommentInput, validatePostSlugQuery } from "@/lib/comments";

export const runtime = "nodejs";

const LIST_LIMIT = 100;

function databaseNotConfigured() {
  return NextResponse.json({ error: "Database not configured." }, { status: 503 });
}

function unauthorized() {
  return NextResponse.json({ error: "Sign in to post a comment." }, { status: 401 });
}

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return databaseNotConfigured();
  }

  const postSlug = new URL(req.url).searchParams.get("postSlug");
  const validation = validatePostSlugQuery(postSlug);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: comments.id,
        postSlug: comments.postSlug,
        userId: comments.userId,
        authorName: comments.authorName,
        body: comments.body,
        imageUrl: comments.imageUrl,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.postSlug, validation.data.postSlug))
      .orderBy(desc(comments.createdAt))
      .limit(LIST_LIMIT);

    const commentsPayload = rows.map((row) => ({
      id: row.id,
      postSlug: row.postSlug,
      userId: row.userId,
      authorName: row.authorName,
      body: row.body,
      imageUrl: row.imageUrl?.trim() || null,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    }));

    return NextResponse.json(
      { comments: commentsPayload },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to load comments." }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return databaseNotConfigured();
  }

  const user = await getSessionUser();
  if (!user) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateCommentInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { postSlug, body: commentBody, imageUrl } = validation.data;
  const storedImageUrl = imageUrl?.trim() || null;

  try {
    const db = getDb();
    const [comment] = await db
      .insert(comments)
      .values({
        postSlug,
        userId: user.id,
        authorName: user.name,
        body: commentBody,
        imageUrl: storedImageUrl,
      })
      .returning({
        id: comments.id,
        postSlug: comments.postSlug,
        userId: comments.userId,
        authorName: comments.authorName,
        body: comments.body,
        imageUrl: comments.imageUrl,
        createdAt: comments.createdAt,
      });

    const commentPayload = {
      id: comment.id,
      postSlug: comment.postSlug,
      userId: comment.userId,
      authorName: comment.authorName,
      body: comment.body,
      imageUrl: comment.imageUrl?.trim() || null,
      createdAt:
        comment.createdAt instanceof Date
          ? comment.createdAt.toISOString()
          : comment.createdAt,
    };

    return NextResponse.json({ comment: commentPayload }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save comment." }, { status: 502 });
  }
}
