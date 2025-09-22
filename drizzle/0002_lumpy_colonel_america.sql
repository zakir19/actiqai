ALTER TABLE "session" ALTER COLUMN "ip_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_agent" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" DROP NOT NULL;