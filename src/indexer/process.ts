import { sql } from 'drizzle-orm';
import { db } from '../db';
import { balances, indexerState, transfers } from '../db/schema';
import { foldDeltas } from './deltas';
import { toTransferRow, type TransferLog } from './mapper';

export async function processBatch(
  tokenAddress: string,
  logs: TransferLog[],
  upToBlock: bigint,
) {
  const rows = logs.map((log) => toTransferRow(log, tokenAddress));
  const deltas = foldDeltas(logs);

  await db.transaction(async (tx) => {
    if (rows.length > 0) {
      await tx.insert(transfers).values(rows).onConflictDoNothing();
    }

    for (const [holder, delta] of deltas) {
      await tx
        .insert(balances)
        .values({
          tokenAddress,
          holderAddress: holder,
          balance: delta.toString(),
          updatedAtBlock: upToBlock,
        })
        .onConflictDoUpdate({
          target: [balances.tokenAddress, balances.holderAddress],
          set: {
            balance: sql`${balances.balance} + ${delta.toString()}::numeric`,
            updatedAtBlock: upToBlock,
          },
        });
    }

    await tx
      .insert(indexerState)
      .values({
        tokenAddress,
        lastProcessedBlock: upToBlock,
      })
      .onConflictDoUpdate({
        target: indexerState.tokenAddress,
        set: { lastProcessedBlock: upToBlock },
      });
  });

  return rows.length;
}
