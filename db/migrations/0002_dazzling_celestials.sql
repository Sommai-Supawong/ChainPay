CREATE TYPE "public"."theme_preference" AS ENUM('dark', 'light');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme_preference" "theme_preference" DEFAULT 'dark' NOT NULL;