CREATE TABLE "balances" (
	"token_address" text NOT NULL,
	"holder_address" text NOT NULL,
	"balance" numeric(78, 0) DEFAULT '0' NOT NULL,
	"updated_at_block" bigint NOT NULL,
	CONSTRAINT "balances_token_address_holder_address_pk" PRIMARY KEY("token_address","holder_address")
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_token_address_tokens_address_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "balances_top_idx" ON "balances" USING btree ("token_address","balance" DESC NULLS LAST);