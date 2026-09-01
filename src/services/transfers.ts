import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { transfers } from '../db/schema';

export interface ListTransfersParams {
  token: string;
  limit: number;
  cursor?: { blockNumber: bigint; logIndex: number };
}

export type Transfer = {
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
};

export interface ListTransfersByHolderParams {
  token: string;
  holder: string;
  limit: number;
}

export async function listTransfersByHolders({
  token,
  holders,
  limit,
}: {
  token: string;
  holders: readonly string[];
  limit: number;
}): Promise<Transfer[]> {
  const rows = await db.execute<Transfer & { holder: string; rn: number }>(sql`
  WITH matched AS (
    SELECT transfers.*, transfers.from_address AS holder
    FROM transfers
    WHERE transfers.token_address = ${token} AND ${inArray(transfers.fromAddress, [...holders])}

    UNION ALL

    SELECT transfers.*, transfers.to_address AS holder
    FROM transfers
    WHERE transfers.token_address = ${token} AND ${inArray(transfers.toAddress, [...holders])}
  ),
  ranked AS (
    SELECT
      id,
      tx_hash AS "txHash",
      token_address AS "tokenAddress",
      block_number AS "blockNumber",
      block_hash AS "blockHash",
      log_index AS "logIndex",
      from_address AS "fromAddress",
      to_address AS "toAddress",
      value,
      block_timestamp AS "blockTimestamp",
      holder,
      ROW_NUMBER() OVER (PARTITION BY holder ORDER BY block_number DESC, log_index DESC) AS rn
    FROM matched
  )
  SELECT * FROM ranked WHERE rn <= ${limit}
`);

  return rows;
}

export async function listTransfersByHolder({
  token,
  holder,
  limit,
}: ListTransfersByHolderParams): Promise<Transfer[]> {
  return db
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
    .where(
      and(
        eq(transfers.tokenAddress, token),
        or(eq(transfers.fromAddress, holder), eq(transfers.toAddress, holder)),
      ),
    )
    .orderBy(desc(transfers.blockNumber), desc(transfers.logIndex))
    .limit(limit);
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
