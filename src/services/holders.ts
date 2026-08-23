import { and, asc, count, desc, eq, gt } from 'drizzle-orm';
import { db } from '../db';
import { balances, indexerState } from '../db/schema';
import env from '../config/env';

interface GetHolderParams {
  holder: string;
  token: string;
}

export interface Holder {
  tokenAddress: string;
  holderAddress: string;
  balance: string;
  updatedAtBlock: bigint | null;
  indexedFromBlock: bigint | null;
  lastProcessedBlock: bigint | null;
}

interface HoldersListParams {
  token: string;
  limit: number;
  page: number;
}

export interface HoldersList {
  holderAddress: string;
  balance: string;
  updatedAtBlock: bigint;
}

export async function getHolder({ holder, token }: GetHolderParams): Promise<Holder> {
  const [[row], [indexer]] = await Promise.all([
    db
      .select({
        tokenAddress: balances.tokenAddress,
        holderAddress: balances.holderAddress,
        balance: balances.balance,
        updatedAtBlock: balances.updatedAtBlock,
      })
      .from(balances)
      .where(and(eq(balances.tokenAddress, token), eq(balances.holderAddress, holder))),
    db
      .select({
        lastProcessedBlock: indexerState.lastProcessedBlock,
      })
      .from(indexerState)
      .where(eq(indexerState.tokenAddress, token)),
  ]);

  if (!row) {
    return {
      tokenAddress: token,
      holderAddress: holder,
      balance: '0',
      updatedAtBlock: null,
      indexedFromBlock: env.START_BLOCK,
      lastProcessedBlock: indexer?.lastProcessedBlock ?? null,
    };
  }

  return {
    ...row,
    indexedFromBlock: env.START_BLOCK,
    lastProcessedBlock: indexer?.lastProcessedBlock ?? null,
  };
}

export async function holdersList({ token, limit, page }: HoldersListParams): Promise<{
  data: HoldersList[];
  totalPages: number;
  total: number;
}> {
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        holderAddress: balances.holderAddress,
        balance: balances.balance,
        updatedAtBlock: balances.updatedAtBlock,
      })
      .from(balances)
      .where(and(eq(balances.tokenAddress, token), gt(balances.balance, '0')))
      .orderBy(desc(balances.balance), asc(balances.holderAddress))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: count() })
      .from(balances)
      .where(and(eq(balances.tokenAddress, token), gt(balances.balance, '0'))),
  ]);

  const total = totalRow?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: rows,
    totalPages,
    total,
  };
}
