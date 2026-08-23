DROP INDEX "balances_top_idx";--> statement-breakpoint
CREATE INDEX "balances_top_holder_idx" ON "balances" USING btree ("token_address","balance" DESC NULLS LAST,"holder_address");