import { and, count, eq, gt, min } from 'drizzle-orm';
import { db } from '../db';
import { balances, indexerState, tokens, transfers } from '../db/schema';

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  indexedFromBlock: bigint;
  lastProcessedBlock: bigint | null;
  transferCount: number;
  holderCount: number;
}

export async function getTokenMetadata(token: string): Promise<TokenMetadata | null> {
  const [tokResult] = await db
    .select({
      address: tokens.address,
      name: tokens.name,
      symbol: tokens.symbol,
      decimals: tokens.decimals,
    })
    .from(tokens)
    .where(eq(tokens.address, token));

  if (!tokResult) {
    return null;
  }

  const [[lastProcessedBlock], [transfersCount], [holderCount], [fromBlock]] =
    await Promise.all([
      db
        .select({ lastProcessedBlock: indexerState.lastProcessedBlock })
        .from(indexerState)
        .where(eq(indexerState.tokenAddress, tokResult.address)),
      db
        .select({ count: count() })
        .from(transfers)
        .where(eq(transfers.tokenAddress, tokResult.address)),
      db
        .select({ count: count() })
        .from(balances)
        .where(
          and(eq(balances.tokenAddress, tokResult.address), gt(balances.balance, '0')),
        ),
      db
        .select({ fromBlock: min(transfers.blockNumber) })
        .from(transfers)
        .where(eq(transfers.tokenAddress, tokResult.address)),
    ]);

  return {
    address: tokResult.address,
    name: tokResult.name,
    symbol: tokResult.symbol,
    decimals: tokResult.decimals,
    indexedFromBlock: fromBlock?.fromBlock ?? 0n,
    lastProcessedBlock: lastProcessedBlock?.lastProcessedBlock ?? null,
    transferCount: transfersCount?.count ?? 0,
    holderCount: holderCount?.count ?? 0,
  };
}
