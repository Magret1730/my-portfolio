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
        authorName: comments.authorName,
        body: comments.body,
        imageUrl: comments.imageUrl,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.postSlug, validation.data.postSlug))
      .orderBy(desc(comments.createdAt))
      .limit(LIST_LIMIT);

    return NextResponse.json(
      { comments: rows },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
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

  try {
    const db = getDb();
    const [comment] = await db
      .insert(comments)
      .values({
        postSlug,
        userId: user.id,
        authorName: user.name,
        body: commentBody,
        imageUrl: imageUrl ?? null,
      })
      .returning({
        id: comments.id,
        postSlug: comments.postSlug,
        authorName: comments.authorName,
        body: comments.body,
        imageUrl: comments.imageUrl,
        createdAt: comments.createdAt,
      });

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save comment." }, { status: 502 });
  }
}
