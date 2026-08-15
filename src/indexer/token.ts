import { erc20Abi } from 'viem';
import { client } from '../chain/client';
import { db } from '../db';
import { tokens } from '../db/schema';

export async function upsertToken(address: `0x${string}`) {
  const [name, symbol, decimals] = await Promise.all([
    client.readContract({ address, abi: erc20Abi, functionName: 'name' }),
    client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
    client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
  ]);

  const row = { address: address.toLowerCase(), name, symbol, decimals };

  await db
    .insert(tokens)
    .values(row)
    .onConflictDoUpdate({ target: tokens.address, set: row });

  return row;
}
