import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postSlug: text("post_slug").notNull(),
    userId: text("user_id"),
    authorName: varchar("author_name", { length: 80 }).notNull(),
    body: text("body").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("comments_post_slug_idx").on(table.postSlug)],
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
