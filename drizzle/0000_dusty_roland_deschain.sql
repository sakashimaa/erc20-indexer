CREATE TABLE "balances" (
	"token_address" text NOT NULL,
	"holder_address" text NOT NULL,
	"balance" numeric(78, 0) DEFAULT '0' NOT NULL,
	"updated_at_block" bigint NOT NULL,
	CONSTRAINT "balances_token_address_holder_address_pk" PRIMARY KEY("token_address","holder_address")
);
--> statement-breakpoint
CREATE TABLE "indexer_state" (
	"token_address" text PRIMARY KEY NOT NULL,
	"last_processed_block" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"address" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimals" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" text PRIMARY KEY NOT NULL,
	"tx_hash" text NOT NULL,
	"token_address" text NOT NULL,
	"block_number" bigint NOT NULL,
	"block_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"value" numeric(78, 0) NOT NULL,
	"block_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexer_state" ADD CONSTRAINT "indexer_state_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "balances_top_idx" ON "balances" USING btree ("token_address","balance" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transfers_token_block_idx" ON "transfers" USING btree ("token_address","block_number");--> statement-breakpoint
CREATE INDEX "transfers_from_idx" ON "transfers" USING btree ("from_address");--> statement-breakpoint
CREATE INDEX "transfers_to_idx" ON "transfers" USING btree ("to_address");