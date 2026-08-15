import { eq } from 'drizzle-orm';
import { db } from '../db';
import { indexerState } from '../db/schema';
import env from '../config/env';

export async function getCursor(tokenAddress: string): Promise<bigint> {
  const [row] = await db
    .select()
    .from(indexerState)
    .where(eq(indexerState.tokenAddress, tokenAddress));

  return row?.lastProcessedBlock ?? env.START_BLOCK - 1n;
}
