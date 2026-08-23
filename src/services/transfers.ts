import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { transfers } from '../db/schema';

export interface ListTransfersParams {
  token: string;
  limit: number;
  cursor?: { blockNumber: bigint; logIndex: number };
}

export interface Transfer {
  id: string;
  txHash: string;
  tokenAddress: string;
  blockNumber: bigint;
  blockHash: string;
  logIndex: number;
  fromAddress: string;
  toAddress: string;
  value: string;
  blockTimestamp: Date;
}

export async function listTransfers({
  token,
  limit,
  cursor,
}: ListTransfersParams): Promise<{ items: Transfer[]; hasMore: boolean }> {
  const conditions = [eq(transfers.tokenAddress, token)];

  if (cursor) {
    conditions.push(
      sql`(${transfers.blockNumber}, ${transfers.logIndex}) < (${cursor.blockNumber}, ${cursor.logIndex})`,
    );
  }

  const rows = await db
    .select({
      id: transfers.id,
      txHash: transfers.txHash,
      tokenAddress: transfers.tokenAddress,
      blockNumber: transfers.blockNumber,
      blockHash: transfers.blockHash,
      logIndex: transfers.logIndex,
      fromAddress: transfers.fromAddress,
      toAddress: transfers.toAddress,
      value: transfers.value,
      blockTimestamp: transfers.blockTimestamp,
    })
    .from(transfers)
    .where(and(...conditions))
    .orderBy(desc(transfers.blockNumber), desc(transfers.logIndex))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return { items, hasMore };
}
