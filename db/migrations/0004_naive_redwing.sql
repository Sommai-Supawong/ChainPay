CREATE TABLE "escrow_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"evidence_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "escrow_submissions" ADD CONSTRAINT "escrow_submissions_milestone_id_escrow_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."escrow_milestones"("id") ON DELETE no action ON UPDATE no action;