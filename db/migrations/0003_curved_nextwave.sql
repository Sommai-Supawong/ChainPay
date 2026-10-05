CREATE TYPE "public"."escrow_status" AS ENUM('created', 'funded', 'disputed', 'refunded', 'released');--> statement-breakpoint
CREATE TYPE "public"."escrow_transactions_type" AS ENUM('deposit', 'release', 'refund', 'dispute_resolved');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'submitted', 'approved', 'released');--> statement-breakpoint
CREATE TABLE "escrow_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"milestone_index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrow_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"milestone_id" uuid,
	"tx_hash" text NOT NULL,
	"type" "escrow_transactions_type" NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"block_number" bigint,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"on_chain_id" text,
	"client_id" uuid NOT NULL,
	"freelancer_address" text NOT NULL,
	"freelancer_id" uuid,
	"contract_address" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"totalAmount" numeric(36, 18) NOT NULL,
	"asset" text DEFAULT 'ETH' NOT NULL,
	"status" "escrow_status" DEFAULT 'created' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "escrows_on_chain_id_unique" UNIQUE("on_chain_id")
);
--> statement-breakpoint
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_escrows_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_escrow_id_escrows_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_milestone_id_escrow_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."escrow_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;