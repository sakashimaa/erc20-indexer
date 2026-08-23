DROP INDEX "transfers_token_block_idx";--> statement-breakpoint
CREATE INDEX "transfers_token_block_log_idx" ON "transfers" USING btree ("token_address","block_number","log_index");