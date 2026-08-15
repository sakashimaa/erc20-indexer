import { client } from '../chain/client';
import env from '../config/env';
import { transferEvent } from './abi';
import { getCursor } from './cursor';
import { isRangeTooLargeError } from './errors';
import { processBatch } from './process';

function min(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export async function backfill(shouldStop: () => boolean) {
  const token = env.TOKEN_ADDRESS;

  const head = await client.getBlockNumber();
  const target = head - env.CONFIRMATIONS;

  let from = (await getCursor(token)) + 1n;

  if (from > target) {
    console.log(`nothing to do: cursor at ${from - 1n}, target ${target}`);
    return;
  }

  console.log(`backfill from ${from}..${target} (${target - from + 1n} blocks)`);

  let batchSize = env.MAX_BLOCK_RANGE;
  let consecutiveOk = 0;

  while (from <= target && !shouldStop()) {
    const to = min(from + batchSize - 1n, target);

    try {
      const logs = await client.getLogs({
        address: token,
        event: transferEvent,
        fromBlock: from,
        toBlock: to,
        strict: true,
      });

      const inserted = await processBatch(token, logs, to);
      console.log(`range ${from}..${to}: logs ${logs.length}, rows: ${inserted}`);

      from = to + 1n;
      consecutiveOk++;

      if (consecutiveOk >= 5 && batchSize < env.MAX_BLOCK_RANGE) {
        batchSize = min(batchSize * 2n, env.MAX_BLOCK_RANGE);
        consecutiveOk = 0;
      }
    } catch (err) {
      if (isRangeTooLargeError(err) && batchSize > 1n) {
        batchSize = batchSize / 2n;
        consecutiveOk = 0;
        console.warn(`range too large, reducing batch to ${batchSize}`);
        continue;
      }

      throw err;
    }
  }
}
