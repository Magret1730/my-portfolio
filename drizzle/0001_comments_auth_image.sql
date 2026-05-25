ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "image_url" text;
