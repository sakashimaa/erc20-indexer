import env from '../config/env';
import { queryClient } from '../db';
import { backfill } from './backfill';
import { upsertToken } from './token';

let stopping = false;
const shouldStop = () => stopping;

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`[${signal}] received, stopping current branch`);
    stopping = true;
  });
}

async function main() {
  const token = await upsertToken(env.TOKEN_ADDRESS);
  console.log(`token: ${token.symbol} (decimals ${token.decimals})`);

  await backfill(shouldStop);

  console.log(stopping ? 'stopped' : 'caught up');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => {
    queryClient.end().catch((e) => console.error('failed to close queryClient', e));
  });
