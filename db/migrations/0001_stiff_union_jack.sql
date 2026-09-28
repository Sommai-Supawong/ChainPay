ALTER TABLE "payment_intents" ADD COLUMN "contract_address" text;--> statement-breakpoint
ALTER TABLE "payment_intents" ADD COLUMN "contract_version" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "contract_address" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "contract_version" integer;--> statement-breakpoint
UPDATE "payment_intents" SET "contract_version" = 1 WHERE "contract_version" IS NULL;--> statement-breakpoint
UPDATE "transactions" SET "contract_version" = 1 WHERE "contract_version" IS NULL;
