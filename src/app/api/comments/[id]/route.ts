import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { comments } from "@/db/schema";
import { tryDeleteBlobUrl } from "@/lib/blob";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function databaseNotConfigured() {
  return NextResponse.json({ error: "Database not configured." }, { status: 503 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!process.env.DATABASE_URL?.trim()) {
    return databaseNotConfigured();
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to delete comments." }, { status: 401 });
  }

  const { id } = await context.params;
  const commentId = id?.trim();
  if (!commentId) {
    return NextResponse.json({ error: "Comment id is required." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        imageUrl: comments.imageUrl,
      })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    if (!existing.userId || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own comments." },
        { status: 403 },
      );
    }

    await tryDeleteBlobUrl(existing.imageUrl);

    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 502 });
  }
}
