import { db } from '../db';
import { indexerState, transfers } from '../db/schema';
import { toTransferRow, type TransferLog } from './mapper';

export async function processBatch(
  tokenAddress: string,
  logs: TransferLog[],
  upToBlock: bigint,
) {
  const rows = logs.map((log) => toTransferRow(log, tokenAddress));

  await db.transaction(async (tx) => {
    if (rows.length > 0) {
      await tx.insert(transfers).values(rows).onConflictDoNothing();
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
