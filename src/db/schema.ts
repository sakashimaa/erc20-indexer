import {
  pgTable,
  text,
  integer,
  bigint,
  numeric,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const tokens = pgTable('tokens', {
  address: text().primaryKey(),
  name: text().notNull(),
  symbol: text().notNull(),
  decimals: integer().notNull(),
});

export const transfers = pgTable(
  'transfers',
  {
    id: text().primaryKey(),
    tokenAddress: text()
      .notNull()
      .references(() => tokens.address),
    blockNumber: bigint({ mode: 'bigint' }).notNull(),
    blockHash: text().notNull(),
    logIndex: integer().notNull(),
    fromAddress: text().notNull(),
    toAddress: text().notNull(),
    value: numeric({ precision: 78, scale: 0 }).notNull(),
    blockTimestamp: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    index('transfers_token_block_idx').on(t.tokenAddress, t.blockNumber),
    index('transfers_from_idx').on(t.fromAddress),
    index('transfers_to_idx').on(t.toAddress),
  ],
);

export const indexerState = pgTable('indexer_state', {
  tokenAddress: text()
    .primaryKey()
    .references(() => tokens.address),
  lastProcessedBlock: bigint({ mode: 'bigint' }).notNull(),
});

export const balances = pgTable(
  'balances',
  {
    tokenAddress: text()
      .notNull()
      .references(() => tokens.address),
    holderAddress: text().notNull(),
    balance: numeric({ precision: 78, scale: 0 }).notNull().default('0'),
    updatedAtBlock: bigint({ mode: 'bigint' }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tokenAddress, t.holderAddress] }),
    index('balances_top_idx').on(t.tokenAddress, t.balance.desc()),
  ],
);
